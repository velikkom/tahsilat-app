package com.veli.tahsilat.collection.importexcel.service.impl;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.importexcel.dto.CollectionDuplicateKey;
import com.veli.tahsilat.collection.importexcel.dto.CustomerMatchResult;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExcelImportServiceImpl implements ExcelImportService {

    private static final int BATCH_SIZE = 100;
    private static final int MAX_ISSUE_DETAILS = 200;

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

        Map<String, Customer> customerIndex =
                customerNameMatcher.buildCustomerIndex();
        Map<CollectionDuplicateKey, CollectionDuplicateKey> existingKeys =
                loadExistingDuplicateKeys();
        Map<CollectionDuplicateKey, Integer> excelKeyFirstRow = new HashMap<>();

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
                        CollectionImportIssueResponse.builder()
                                .rowNumber(row.getRowNumber())
                                .customerName(row.getCustomerName())
                                .issueType("INVALID")
                                .message(validationError.get())
                                .build()
                );
                continue;
            }

            CustomerMatchResult matchResult = customerNameMatcher.match(
                    row.getCustomerName(),
                    customerIndex
            );

            if (!matchResult.isMatched()) {
                invalidRows++;
                addIssue(
                        issues,
                        CollectionImportIssueResponse.builder()
                                .rowNumber(row.getRowNumber())
                                .customerName(row.getCustomerName())
                                .issueType("CUSTOMER_NOT_FOUND")
                                .normalizedCustomerName(
                                        matchResult.getNormalizedCustomerName()
                                )
                                .message(
                                        "Müşteri bulunamadı. Normalize edilmiş ad: "
                                                + matchResult.getNormalizedCustomerName()
                                )
                                .build()
                );
                continue;
            }

            Customer customer = matchResult.getCustomer();

            CollectionDuplicateKey duplicateKey = CollectionDuplicateKey.of(
                    customer.getId(),
                    row.getAmount(),
                    row.getCollectionDate(),
                    row.getPaymentType(),
                    row.getMaturityDate()
            );

            Integer excelConflictRow = excelKeyFirstRow.get(duplicateKey);

            if (excelConflictRow != null) {
                duplicateRows++;
                addIssue(
                        issues,
                        buildDuplicateIssue(
                                row,
                                customer,
                                matchResult,
                                "EXCEL",
                                excelConflictRow,
                                duplicateKey
                        )
                );
                continue;
            }

            if (existingKeys.containsKey(duplicateKey)) {
                duplicateRows++;
                CollectionDuplicateKey databaseKey =
                        existingKeys.get(duplicateKey);

                addIssue(
                        issues,
                        buildDuplicateIssue(
                                row,
                                customer,
                                matchResult,
                                "DATABASE",
                                null,
                                databaseKey
                        )
                );
                continue;
            }

            excelKeyFirstRow.put(duplicateKey, row.getRowNumber());
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

    private Map<CollectionDuplicateKey, CollectionDuplicateKey> loadExistingDuplicateKeys() {
        Map<CollectionDuplicateKey, CollectionDuplicateKey> keys = new HashMap<>();

        for (Object[] row : collectionRepository.findActiveCollectionDuplicateKeys()) {
            CollectionDuplicateKey key = CollectionDuplicateKey.of(
                    (UUID) row[0],
                    (BigDecimal) row[1],
                    (LocalDate) row[2],
                    (PaymentType) row[3],
                    (LocalDate) row[4]
            );

            keys.put(key, key);
        }

        return keys;
    }

    private CollectionImportIssueResponse buildDuplicateIssue(
            ParsedCollectionImportRow row,
            Customer customer,
            CustomerMatchResult matchResult,
            String conflictSource,
            Integer conflictRowNumber,
            CollectionDuplicateKey conflictKey
    ) {
        String duplicateReason = conflictKey.requiresMaturityDateInKey()
                ? "Aynı müşteri, tutar, tahsilat tarihi, ödeme türü ve vade tarihi."
                : "Aynı müşteri, tutar, tahsilat tarihi ve ödeme türü.";

        String conflictMessage = "EXCEL".equals(conflictSource)
                ? "Excel satır " + conflictRowNumber + " ile çakışıyor. " + duplicateReason
                : "Veritabanındaki mevcut kayıt ile çakışıyor. " + duplicateReason;

        return CollectionImportIssueResponse.builder()
                .rowNumber(row.getRowNumber())
                .customerName(row.getCustomerName())
                .issueType("DUPLICATE")
                .message(conflictMessage)
                .normalizedCustomerName(matchResult.getNormalizedCustomerName())
                .matchedCustomerId(customer.getId())
                .matchedCustomerName(customer.getCompanyName())
                .conflictSource(conflictSource)
                .conflictRowNumber(conflictRowNumber)
                .conflictCustomerId(conflictKey.getCustomerId())
                .conflictAmount(conflictKey.getAmount())
                .conflictCollectionDate(conflictKey.getCollectionDate())
                .conflictPaymentType(conflictKey.getPaymentType())
                .conflictMaturityDate(conflictKey.getMaturityDate())
                .build();
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
            CollectionImportIssueResponse issue
    ) {
        if (issues.size() >= MAX_ISSUE_DETAILS) {
            return;
        }

        issues.add(issue);
    }
}
