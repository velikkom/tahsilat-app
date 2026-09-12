package com.veli.tahsilat.trip.export;

import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.trip.entity.Trip;
import com.veli.tahsilat.trip.entity.TripDailyExpense;
import com.veli.tahsilat.user.entity.User;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TripExpenseDocumentGeneratorTest {

    private final TripExpenseDocumentGenerator generator = new TripExpenseDocumentGenerator();

    @Test
    void remainingCashFormulaIsCorrect() throws IOException {
        Trip trip = baseTrip();
        trip.setWeeklyAllowance(new BigDecimal("100"));
        trip.setCommissionReceived(new BigDecimal("50"));
        trip.setExtraReceived(BigDecimal.ZERO);
        trip.setAgiReceived(new BigDecimal("50"));

        TripDailyExpense dailyExpense = new TripDailyExpense();
        dailyExpense.setExpenseDate(trip.getStartDate());
        dailyExpense.setMealAmount(new BigDecimal("200"));
        trip.getDailyExpenses().add(dailyExpense);

        Map<PaymentType, BigDecimal> collectionSumsByType = new EnumMap<>(PaymentType.class);
        collectionSumsByType.put(PaymentType.CASH, new BigDecimal("1000"));

        byte[] bytes = generator.generate(trip, collectionSumsByType);

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheetAt(0);

            assertEquals(600.0, findValueAfterLabel(sheet, "KALAN NAKİT"), 0.001);
            assertEquals(1000.0, findValueAfterLabel(sheet, "NAKİT TAHSİLAT"), 0.001);
            assertEquals(200.0, findValueAfterLabel(sheet, "MASRAF TOPLAMI"), 0.001);
        }
    }

    @Test
    void creditCardCollectionsAreExcludedFromForm2() throws IOException {
        Trip trip = baseTrip();

        Map<PaymentType, BigDecimal> collectionSumsByType = new EnumMap<>(PaymentType.class);
        collectionSumsByType.put(PaymentType.CASH, new BigDecimal("300"));
        collectionSumsByType.put(PaymentType.CREDIT_CARD, new BigDecimal("500"));

        byte[] bytes = generator.generate(trip, collectionSumsByType);

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheetAt(0);

            assertEquals(0.0, findValueAfterLabel(sheet, "MAILORDER KARLAND"), 0.001);
            assertEquals(0.0, findValueAfterLabel(sheet, "MAILORDER OTOKOÇ"), 0.001);
            assertEquals(0.0, findValueAfterLabel(sheet, "POS YKB"), 0.001);
            assertEquals(0.0, findValueAfterLabel(sheet, "POS TEB"), 0.001);

            // GENEL TOPLAM must equal CASH only (300) - the 500 credit card
            // amount must not leak into any Form 2 row.
            assertEquals(300.0, findValueAfterLabel(sheet, "GENEL TOPLAM"), 0.001);
            assertEquals(300.0, findValueAfterLabel(sheet, "NAKİT TAHSİLAT"), 0.001);
        }
    }

    @Test
    void mailOrderKarlandTotalIsWrittenToItsOwnRowAndIncludedInGenelToplam() throws IOException {
        Trip trip = baseTrip();

        Map<PaymentType, BigDecimal> collectionSumsByType = new EnumMap<>(PaymentType.class);
        collectionSumsByType.put(PaymentType.CASH, new BigDecimal("300"));
        collectionSumsByType.put(PaymentType.MAIL_ORDER_KARLAND, new BigDecimal("400"));
        collectionSumsByType.put(PaymentType.CREDIT_CARD, new BigDecimal("500"));

        byte[] bytes = generator.generate(trip, collectionSumsByType);

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheetAt(0);

            assertEquals(400.0, findValueAfterLabel(sheet, "MAILORDER KARLAND"), 0.001);
            assertEquals(0.0, findValueAfterLabel(sheet, "MAILORDER OTOKOÇ"), 0.001);
            assertEquals(0.0, findValueAfterLabel(sheet, "POS YKB"), 0.001);
            assertEquals(0.0, findValueAfterLabel(sheet, "POS TEB"), 0.001);

            // GENEL TOPLAM must equal CASH + MAIL_ORDER_KARLAND (700) - the
            // 500 credit card amount must not leak into any Form 2 row.
            assertEquals(700.0, findValueAfterLabel(sheet, "GENEL TOPLAM"), 0.001);

            // Kalan nakit formulası yalnizca CASH'e bakar, MAIL_ORDER_KARLAND dahil olmaz.
            assertEquals(300.0, findValueAfterLabel(sheet, "NAKİT TAHSİLAT"), 0.001);
        }
    }

    @Test
    void salesmanFullNameIsWrittenToDocument() throws IOException {
        Trip trip = baseTrip();

        byte[] bytes = generator.generate(trip, new EnumMap<>(PaymentType.class));

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheetAt(0);

            assertEquals("Test Salesman", findStringValueAfterLabel(sheet, "SATIŞ PERSONELİ"));
        }
    }

    @Test
    void generatedFileHasXlsxMagicBytes() {
        Trip trip = baseTrip();

        byte[] bytes = generator.generate(trip, new EnumMap<>(PaymentType.class));

        assertNotNull(bytes);
        assertTrue(bytes.length > 2);
        assertEquals(0x50, bytes[0]);
        assertEquals(0x4B, bytes[1]);
    }

    private Trip baseTrip() {
        User salesman = new User();
        salesman.setId(UUID.randomUUID());
        salesman.setFirstName("Test");
        salesman.setLastName("Salesman");

        Trip trip = new Trip();
        trip.setSalesman(salesman);
        trip.setStartDate(LocalDate.of(2026, 3, 2));
        trip.setEndDate(LocalDate.of(2026, 3, 4));
        return trip;
    }

    private double findValueAfterLabel(Sheet sheet, String label) {
        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cell.getCellType() == CellType.STRING
                        && label.equals(cell.getStringCellValue())) {
                    Cell valueCell = row.getCell(cell.getColumnIndex() + 1);
                    return valueCell == null ? 0.0 : valueCell.getNumericCellValue();
                }
            }
        }

        throw new AssertionError("Label not found in sheet: " + label);
    }

    private String findStringValueAfterLabel(Sheet sheet, String label) {
        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cell.getCellType() == CellType.STRING
                        && label.equals(cell.getStringCellValue())) {
                    Cell valueCell = row.getCell(cell.getColumnIndex() + 1);
                    return valueCell == null ? null : valueCell.getStringCellValue();
                }
            }
        }

        throw new AssertionError("Label not found in sheet: " + label);
    }
}
