package com.veli.tahsilat.trip.importexcel.service.impl;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.importexcel.dto.CollectionDuplicateKey;
import com.veli.tahsilat.collection.importexcel.dto.CustomerMatchResult;
import com.veli.tahsilat.collection.importexcel.support.CustomerNameMatcher;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.collection.validation.CollectionDuplicateValidator;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.trip.dto.request.TripDailyExpenseRequest;
import com.veli.tahsilat.trip.dto.request.TripRequest;
import com.veli.tahsilat.trip.dto.response.TripResponse;
import com.veli.tahsilat.trip.importexcel.dto.ParsedTripCollectionRow;
import com.veli.tahsilat.trip.importexcel.dto.ParsedTripDailyExpenseRow;
import com.veli.tahsilat.trip.importexcel.dto.ParsedTripExpenseSheet;
import com.veli.tahsilat.trip.importexcel.dto.response.TripImportIssueResponse;
import com.veli.tahsilat.trip.importexcel.dto.response.TripImportResultResponse;
import com.veli.tahsilat.trip.importexcel.service.TripExcelImportService;
import com.veli.tahsilat.trip.importexcel.support.SalesmanNameMatcher;
import com.veli.tahsilat.trip.importexcel.support.TripCollectionSheetParser;
import com.veli.tahsilat.trip.importexcel.support.TripExpenseSheetParser;
import com.veli.tahsilat.trip.repository.TripRepository;
import com.veli.tahsilat.trip.service.TripService;
import com.veli.tahsilat.user.entity.User;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Orchestrates the two-sheet trip import: Form 2 ("ÖN") gives the trip
 * header (salesman, vehicle, daily expenses); Form 1 ("ARKA") gives the
 * collection rows. Mirrors ExcelImportServiceImpl's shared
 * dry-run/persist process() method, matcher/duplicate-key reuse, and
 * issue-capping pattern.
 */
@Service
@RequiredArgsConstructor
public class TripExcelImportServiceImpl implements TripExcelImportService {

    private static final int MAX_ISSUE_DETAILS = 200;

    private final TripExpenseSheetParser expenseSheetParser;
    private final TripCollectionSheetParser collectionSheetParser;
    private final SalesmanNameMatcher salesmanNameMatcher;
    private final CustomerNameMatcher customerNameMatcher;
    private final CollectionDuplicateValidator collectionDuplicateValidator;
    private final CollectionRepository collectionRepository;
    private final TripRepository tripRepository;
    private final TripService tripService;

    @Override
    @Transactional(readOnly = true)
    public TripImportResultResponse dryRun(MultipartFile collectionFile, MultipartFile expenseFile) {
        return process(collectionFile, expenseFile, false, false);
    }

    @Override
    @Transactional
    public TripImportResultResponse importTrip(
            MultipartFile collectionFile,
            MultipartFile expenseFile,
            boolean confirmOverlap
    ) {
        return process(collectionFile, expenseFile, true, confirmOverlap);
    }

    private TripImportResultResponse process(
            MultipartFile collectionFile,
            MultipartFile expenseFile,
            boolean persist,
            boolean confirmOverlap
    ) {
        ParsedTripExpenseSheet expenseSheet = expenseSheetParser.parse(expenseFile);
        List<ParsedTripCollectionRow> collectionRows = collectionSheetParser.parse(collectionFile);

        List<TripImportIssueResponse> issues = new ArrayList<>();

        LocalDate startDate = expenseSheet.getDailyExpenses().stream()
                .map(ParsedTripDailyExpenseRow::getExpenseDate)
                .min(Comparator.naturalOrder())
                .orElse(null);
        LocalDate endDate = expenseSheet.getDailyExpenses().stream()
                .map(ParsedTripDailyExpenseRow::getExpenseDate)
                .max(Comparator.naturalOrder())
                .orElse(null);

        Optional<User> salesmanMatch = salesmanNameMatcher.match(expenseSheet.getSalesmanName());

        if (salesmanMatch.isEmpty()) {
            addIssue(issues, TripImportIssueResponse.builder()
                    .issueType("SALESMAN_NOT_FOUND")
                    .message(
                            "Satış personeli eşleştirilemedi: "
                                    + (isBlank(expenseSheet.getSalesmanName()) ? "(boş)" : expenseSheet.getSalesmanName())
                    )
                    .build());
        }

        for (ParsedTripCollectionRow row : collectionRows) {
            if (row.getCollectionDate() != null
                    && (row.getCollectionDate().isBefore(startDate) || row.getCollectionDate().isAfter(endDate))) {
                addIssue(issues, TripImportIssueResponse.builder()
                        .rowNumber(row.getRowNumber())
                        .customerName(row.getCustomerName())
                        .issueType("DATE_OUT_OF_RANGE")
                        .message(
                                "Tahsilat tarihi (" + row.getCollectionDate()
                                        + ") tur tarih aralığının (" + startDate + " - " + endDate + ") dışında."
                        )
                        .build());
            }
        }

        boolean hasOverlap = false;

        if (salesmanMatch.isPresent()) {
            hasOverlap = tripRepository
                    .findBySalesmanIdAndActiveTrueAndDateRangeOverlap(
                            salesmanMatch.get().getId(), startDate, endDate, PageRequest.of(0, 1)
                    )
                    .hasContent();

            if (hasOverlap) {
                addIssue(issues, TripImportIssueResponse.builder()
                        .issueType("TRIP_OVERLAP")
                        .message(
                                "Bu satış personeli için " + startDate + " - " + endDate
                                        + " aralığıyla çakışan aktif bir tur zaten var."
                                        + (persist && !confirmOverlap ? " İçe aktarma iptal edildi." : "")
                        )
                        .build());
            }
        }

        Map<String, Customer> customerIndex = customerNameMatcher.buildCustomerIndex();
        Map<CollectionDuplicateKey, CollectionDuplicateKey> existingKeys =
                collectionDuplicateValidator.loadActiveDuplicateKeys();
        Map<CollectionDuplicateKey, Integer> fileKeyFirstRow = new HashMap<>();

        int validRows = 0;
        int duplicateRows = 0;
        int invalidRows = 0;
        List<Collection> batch = new ArrayList<>();

        for (ParsedTripCollectionRow row : collectionRows) {
            Optional<String> validationError = validateRow(row);

            if (validationError.isPresent()) {
                invalidRows++;
                addIssue(issues, TripImportIssueResponse.builder()
                        .rowNumber(row.getRowNumber())
                        .customerName(row.getCustomerName())
                        .issueType("INVALID")
                        .message(validationError.get())
                        .build());
                continue;
            }

            CustomerMatchResult matchResult = customerNameMatcher.match(row.getCustomerName(), customerIndex);

            if (!matchResult.isMatched()) {
                invalidRows++;
                addIssue(issues, TripImportIssueResponse.builder()
                        .rowNumber(row.getRowNumber())
                        .customerName(row.getCustomerName())
                        .issueType("CUSTOMER_NOT_FOUND")
                        .message("Müşteri bulunamadı. Normalize edilmiş ad: " + matchResult.getNormalizedCustomerName())
                        .build());
                continue;
            }

            Customer customer = matchResult.getCustomer();

            CollectionDuplicateKey duplicateKey = CollectionDuplicateKey.of(
                    customer.getId(), row.getAmount(), row.getCollectionDate(), row.getPaymentType(), row.getMaturityDate()
            );

            if (fileKeyFirstRow.containsKey(duplicateKey) || existingKeys.containsKey(duplicateKey)) {
                duplicateRows++;
                addIssue(issues, TripImportIssueResponse.builder()
                        .rowNumber(row.getRowNumber())
                        .customerName(row.getCustomerName())
                        .issueType("DUPLICATE")
                        .message("Bu tahsilat dosya içinde veya sistemde zaten kayıtlı (aynı müşteri, tutar, tarih, ödeme türü).")
                        .build());
                continue;
            }

            fileKeyFirstRow.put(duplicateKey, row.getRowNumber());
            validRows++;

            if (persist) {
                batch.add(buildCollection(row, customer, salesmanMatch.orElse(null)));
            }
        }

        boolean canPersistTrip = persist
                && salesmanMatch.isPresent()
                && (!hasOverlap || confirmOverlap);

        UUID tripId = null;
        int importedRows = 0;

        if (canPersistTrip) {
            TripRequest tripRequest = buildTripRequest(expenseSheet, startDate, endDate);
            TripResponse tripResponse = tripService.createTripForSalesman(tripRequest, salesmanMatch.get());
            tripId = tripResponse.getId();

            if (!batch.isEmpty()) {
                collectionRepository.saveAll(batch);
            }

            importedRows = validRows;
        }

        String salesmanName = salesmanMatch
                .map(user -> ((user.getFirstName() == null ? "" : user.getFirstName())
                        + " " + (user.getLastName() == null ? "" : user.getLastName())).trim())
                .orElse(expenseSheet.getSalesmanName());

        return TripImportResultResponse.builder()
                .tripId(tripId)
                .salesmanName(salesmanName)
                .vehiclePlate(expenseSheet.getVehiclePlate())
                .startDate(startDate)
                .endDate(endDate)
                .dayCount(expenseSheet.getDailyExpenses().size())
                .totalRows(collectionRows.size())
                .validRows(validRows)
                .importedRows(importedRows)
                .duplicateRows(duplicateRows)
                .invalidRows(invalidRows)
                .hasOverlap(hasOverlap)
                .issues(issues)
                .build();
    }

    private Optional<String> validateRow(ParsedTripCollectionRow row) {
        if (isBlank(row.getCustomerName())) {
            return Optional.of("Müşteri adı boş.");
        }

        if (row.getCollectionDate() == null) {
            return Optional.of("Tahsilat tarihi geçersiz.");
        }

        if (row.getPaymentType() == null || row.getAmount() == null
                || row.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return Optional.of("Ödeme tipi/tutarı satırdan belirlenemedi.");
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

    private Collection buildCollection(ParsedTripCollectionRow row, Customer customer, User collectedBy) {
        Collection collection = new Collection();
        collection.setCustomer(customer);
        collection.setAmount(row.getAmount());
        collection.setCollectionDate(row.getCollectionDate());
        collection.setMaturityDate(row.getMaturityDate());
        collection.setPaymentType(row.getPaymentType());
        collection.setBankName(row.getBankName());
        collection.setMailOrderCompany(row.getMailOrderCompany());
        collection.setReceiptNumber(row.getReceiptNumber());
        collection.setMikroSr(row.getMikroSr());
        collection.setMikroNo(row.getMikroNo());
        collection.setStatus(CollectionStatus.PAID);
        collection.setDescription("Excel import (Form 1)");
        collection.setCollectedBy(collectedBy);
        return collection;
    }

    private TripRequest buildTripRequest(ParsedTripExpenseSheet sheet, LocalDate startDate, LocalDate endDate) {
        TripRequest request = new TripRequest();
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        request.setVehiclePlate(sheet.getVehiclePlate());
        request.setDenizliExitKm(sheet.getDenizliExitKm());
        request.setDenizliEntryKm(sheet.getDenizliEntryKm());
        request.setExitFuelAmount(sheet.getExitFuelAmount());
        request.setTripFuelAmount(sheet.getTripFuelAmount());
        request.setDailyExpenses(sheet.getDailyExpenses().stream().map(this::toDailyExpenseRequest).toList());
        return request;
    }

    private TripDailyExpenseRequest toDailyExpenseRequest(ParsedTripDailyExpenseRow row) {
        TripDailyExpenseRequest request = new TripDailyExpenseRequest();
        request.setExpenseDate(row.getExpenseDate());
        request.setMealAmount(row.getMealAmount());
        request.setHotelAmount(row.getHotelAmount());
        request.setFuelInvoiceAmount(row.getFuelInvoiceAmount());
        request.setOtherAmount(row.getOtherAmount());
        request.setEveningHotelKm(row.getEveningHotelKm());
        return request;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void addIssue(List<TripImportIssueResponse> issues, TripImportIssueResponse issue) {
        if (issues.size() >= MAX_ISSUE_DETAILS) {
            return;
        }

        issues.add(issue);
    }
}
