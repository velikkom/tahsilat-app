package com.veli.tahsilat.collection.importexcel.service.impl;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.importexcel.dto.CollectionDuplicateKey;
import com.veli.tahsilat.collection.importexcel.dto.ParsedCollectionImportRow;
import com.veli.tahsilat.collection.importexcel.dto.response.CollectionImportIssueResponse;
import com.veli.tahsilat.collection.importexcel.dto.response.CollectionImportResultResponse;
import com.veli.tahsilat.collection.importexcel.service.ExcelImportService;
import com.veli.tahsilat.collection.importexcel.support.CollectionExcelParser;
import com.veli.tahsilat.collection.importexcel.support.CustomerNameMatcher;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.customer.entity.Customer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExcelImportServiceImpl implements ExcelImportService {

    private static final int BATCH_SIZE = 100;
    private static final int MAX_ISSUE_DETAILS = 100;

    private final CollectionExcelParser collectionExcelParser;
    private final CustomerNameMatcher customerNameMatcher;
    private final CollectionRepository collectionRepository;

    @Override
    @Transactional(readOnly = true)
    public CollectionImportResultResponse dryRun(MultipartFile file) {
        return process(file, false);
    }

    @Override
    @Transactional
    public CollectionImportResultResponse importCollections(MultipartFile file) {
        return process(file, true);
    }

    private CollectionImportResultResponse process(
            MultipartFile file,
            boolean persist
    ) {
        List<ParsedCollectionImportRow> parsedRows =
                collectionExcelParser.parse(file);

        Set<CollectionDuplicateKey> existingKeys = loadExistingDuplicateKeys();
        Set<CollectionDuplicateKey> excelKeys = new HashSet<>();

        int duplicateRows = 0;
        int invalidRows = 0;
        int validRows = 0;
        List<CollectionImportIssueResponse> issues = new ArrayList<>();
        List<Collection> batch = new ArrayList<>();

        for (ParsedCollectionImportRow row : parsedRows) {
            Optional<String> validationError = validateRow(row);

            if (validationError.isPresent()) {
                invalidRows++;
                addIssue(
                        issues,
                        row,
                        "INVALID",
                        validationError.get()
                );
                continue;
            }

            Optional<Customer> customerOptional =
                    customerNameMatcher.match(row.getCustomerName());

            if (customerOptional.isEmpty()) {
                invalidRows++;
                addIssue(
                        issues,
                        row,
                        "INVALID",
                        "Müşteri bulunamadı: " + row.getCustomerName()
                );
                continue;
            }

            Customer customer = customerOptional.get();

            CollectionDuplicateKey duplicateKey = CollectionDuplicateKey.of(
                    customer.getId(),
                    row.getAmount(),
                    row.getCollectionDate(),
                    row.getPaymentType()
            );

            if (excelKeys.contains(duplicateKey) || existingKeys.contains(duplicateKey)) {
                duplicateRows++;
                addIssue(
                        issues,
                        row,
                        "DUPLICATE",
                        "Duplicate kayıt tespit edildi."
                );
                continue;
            }

            excelKeys.add(duplicateKey);
            validRows++;

            if (persist) {
                batch.add(buildCollection(row, customer));

                if (batch.size() >= BATCH_SIZE) {
                    collectionRepository.saveAll(batch);
                    batch.clear();
                }
            }
        }

        if (persist && !batch.isEmpty()) {
            collectionRepository.saveAll(batch);
        }

        return CollectionImportResultResponse.builder()
                .totalRows(parsedRows.size())
                .validRows(validRows)
                .importedRows(persist ? validRows : 0)
                .duplicateRows(duplicateRows)
                .invalidRows(invalidRows)
                .issues(issues)
                .build();
    }

    private Set<CollectionDuplicateKey> loadExistingDuplicateKeys() {
        Set<CollectionDuplicateKey> keys = new HashSet<>();

        for (Object[] row : collectionRepository.findActiveCollectionDuplicateKeys()) {
            keys.add(
                    CollectionDuplicateKey.of(
                            (UUID) row[0],
                            (BigDecimal) row[1],
                            (LocalDate) row[2],
                            (PaymentType) row[3]
                    )
            );
        }

        return keys;
    }

    private Optional<String> validateRow(ParsedCollectionImportRow row) {
        if (row.getCustomerName() == null || row.getCustomerName().isBlank()) {
            return Optional.of("Müşteri adı boş.");
        }

        if (row.getCollectionDate() == null) {
            return Optional.of("Tahsilat tarihi geçersiz.");
        }

        if (row.getAmount() == null || row.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return Optional.of("Tutar geçersiz.");
        }

        boolean requiresMaturityDate =
                row.getPaymentType() == PaymentType.CHECK
                        || row.getPaymentType() == PaymentType.PROMISSORY_NOTE;

        if (requiresMaturityDate && row.getMaturityDate() == null) {
            return Optional.of("Vade tarihi zorunlu.");
        }

        if (!requiresMaturityDate && row.getMaturityDate() != null) {
            return Optional.of("Bu ödeme türü için vade tarihi kullanılamaz.");
        }

        return Optional.empty();
    }

    private Collection buildCollection(
            ParsedCollectionImportRow row,
            Customer customer
    ) {
        Collection collection = new Collection();
        collection.setCustomer(customer);
        collection.setAmount(row.getAmount());
        collection.setCollectionDate(row.getCollectionDate());
        collection.setMaturityDate(row.getMaturityDate());
        collection.setPaymentType(row.getPaymentType());
        collection.setStatus(CollectionStatus.PAID);
        collection.setDescription("Excel import");
        return collection;
    }

    private void addIssue(
            List<CollectionImportIssueResponse> issues,
            ParsedCollectionImportRow row,
            String issueType,
            String message
    ) {
        if (issues.size() >= MAX_ISSUE_DETAILS) {
            return;
        }

        issues.add(
                CollectionImportIssueResponse.builder()
                        .rowNumber(row.getRowNumber())
                        .customerName(row.getCustomerName())
                        .issueType(issueType)
                        .message(message)
                        .build()
        );
    }
}
