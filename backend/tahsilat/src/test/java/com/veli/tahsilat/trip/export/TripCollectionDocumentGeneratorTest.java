package com.veli.tahsilat.trip.export;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.trip.entity.Trip;
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
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TripCollectionDocumentGeneratorTest {

    private final TripCollectionDocumentGenerator generator = new TripCollectionDocumentGenerator();

    @Test
    void cashAmountIsWrittenToCashColumnOnly() throws IOException {
        Trip trip = baseTrip();
        Collection cashCollection = collection("Nakit Musteri", PaymentType.CASH, new BigDecimal("500"), null);

        byte[] bytes = generator.generate(trip, List.of(cashCollection));

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheetAt(0);

            int rowIndex = findRowByUnvani(sheet, "Nakit Musteri");
            int nakitColumn = findColumnIndex(sheet, "NAKİT TUTARI");
            int senetColumn = findColumnIndex(sheet, "TUTAR", 0);
            int cekColumn = findColumnIndex(sheet, "TUTAR", 1);
            int havaleColumn = findColumnIndex(sheet, "TUTAR", 2);

            assertEquals(500.0, numericValue(sheet, rowIndex, nakitColumn), 0.001);
            assertNull(numericValue(sheet, rowIndex, senetColumn));
            assertNull(numericValue(sheet, rowIndex, cekColumn));
            assertNull(numericValue(sheet, rowIndex, havaleColumn));
        }
    }

    @Test
    void creditCardCollectionIsWrittenToNoColumnAndExcludedFromTotal() throws IOException {
        Trip trip = baseTrip();
        Collection creditCardCollection =
                collection("Kart Musteri", PaymentType.CREDIT_CARD, new BigDecimal("750"), null);

        byte[] bytes = generator.generate(trip, List.of(creditCardCollection));

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheetAt(0);

            int rowIndex = findRowByUnvani(sheet, "Kart Musteri");
            int nakitColumn = findColumnIndex(sheet, "NAKİT TUTARI");
            int senetColumn = findColumnIndex(sheet, "TUTAR", 0);
            int cekColumn = findColumnIndex(sheet, "TUTAR", 1);
            int havaleColumn = findColumnIndex(sheet, "TUTAR", 2);
            int karlandColumn = findColumnIndex(sheet, "MAILORDER KARLAND");
            int otokocColumn = findColumnIndex(sheet, "MAILORDER OTOKOÇ");

            assertNull(numericValue(sheet, rowIndex, nakitColumn));
            assertNull(numericValue(sheet, rowIndex, senetColumn));
            assertNull(numericValue(sheet, rowIndex, cekColumn));
            assertNull(numericValue(sheet, rowIndex, havaleColumn));
            assertNull(numericValue(sheet, rowIndex, karlandColumn));
            assertNull(numericValue(sheet, rowIndex, otokocColumn));

            int totalRowIndex = findRowByUnvani(sheet, "GENEL TOPLAM");
            assertEquals(0.0, numericValueOrZero(sheet, totalRowIndex, nakitColumn), 0.001);
        }
    }

    @Test
    void receiptMikroAndBankFieldsAreWrittenToDocument() throws IOException {
        Trip trip = baseTrip();
        Collection bankTransferCollection = collection(
                "Havale Musteri",
                PaymentType.BANK_TRANSFER,
                new BigDecimal("200"),
                null,
                "MKB-001",
                "12",
                "345",
                "Ziraat Bankası"
        );

        byte[] bytes = generator.generate(trip, List.of(bankTransferCollection));

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheetAt(0);

            int rowIndex = findRowByUnvani(sheet, "Havale Musteri");

            assertEquals("MKB-001", stringValue(sheet, rowIndex, findColumnIndex(sheet, "TAHSİLAT MAKBUZ NO")));
            assertEquals("12", stringValue(sheet, rowIndex, findColumnIndex(sheet, "SR")));
            assertEquals("345", stringValue(sheet, rowIndex, findColumnIndex(sheet, "NO")));
            assertEquals("Ziraat Bankası", stringValue(sheet, rowIndex, findColumnIndex(sheet, "BANKA ADI")));

            // BANK_TRANSFER also copies the bank name into the HAVALE group's
            // own BANKA sub-column, alongside the amount.
            int havaleBankaColumn = findColumnIndex(sheet, "BANKA");
            int havaleTutarColumn = findColumnIndex(sheet, "TUTAR", 2);

            assertEquals("Ziraat Bankası", stringValue(sheet, rowIndex, havaleBankaColumn));
            assertEquals(200.0, numericValue(sheet, rowIndex, havaleTutarColumn), 0.001);
        }
    }

    @Test
    void salesmanFullNameIsWrittenToDocument() throws IOException {
        Trip trip = baseTrip();

        byte[] bytes = generator.generate(trip, List.of());

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheetAt(0);

            assertEquals("Test Salesman", findStringValueAfterLabel(sheet, "SATIŞ PERSONELİ ADI/SOYADI"));
        }
    }

    @Test
    void generatedFileHasXlsxMagicBytes() {
        Trip trip = baseTrip();

        byte[] bytes = generator.generate(trip, List.of());

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

    private Collection collection(
            String customerName,
            PaymentType paymentType,
            BigDecimal amount,
            LocalDate maturityDate
    ) {
        return collection(customerName, paymentType, amount, maturityDate, null, null, null, null);
    }

    private Collection collection(
            String customerName,
            PaymentType paymentType,
            BigDecimal amount,
            LocalDate maturityDate,
            String receiptNumber,
            String mikroSr,
            String mikroNo,
            String bankName
    ) {
        Customer customer = new Customer();
        customer.setCompanyName(customerName);

        Collection collectionEntity = new Collection();
        collectionEntity.setCustomer(customer);
        collectionEntity.setPaymentType(paymentType);
        collectionEntity.setAmount(amount);
        collectionEntity.setCollectionDate(LocalDate.of(2026, 3, 3));
        collectionEntity.setMaturityDate(maturityDate);
        collectionEntity.setReceiptNumber(receiptNumber);
        collectionEntity.setMikroSr(mikroSr);
        collectionEntity.setMikroNo(mikroNo);
        collectionEntity.setBankName(bankName);
        return collectionEntity;
    }

    private int findRowByUnvani(Sheet sheet, String value) {
        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cell.getCellType() == CellType.STRING && value.equals(cell.getStringCellValue())) {
                    return row.getRowNum();
                }
            }
        }

        throw new AssertionError("Row not found for value: " + value);
    }

    private int findColumnIndex(Sheet sheet, String label) {
        return findColumnIndex(sheet, label, 0);
    }

    /**
     * Some sub-headers (e.g. "TUTAR") repeat under multiple groups
     * (SENET/ÇEK/HAVALE); occurrence selects which one, in sheet order.
     */
    private int findColumnIndex(Sheet sheet, String label, int occurrence) {
        int seen = 0;

        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cell.getCellType() == CellType.STRING && label.equals(cell.getStringCellValue())) {
                    if (seen == occurrence) {
                        return cell.getColumnIndex();
                    }
                    seen++;
                }
            }
        }

        throw new AssertionError("Column not found for label: " + label + " occurrence " + occurrence);
    }

    private Double numericValue(Sheet sheet, int rowIndex, int columnIndex) {
        Row row = sheet.getRow(rowIndex);
        if (row == null) {
            return null;
        }

        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            return null;
        }

        return cell.getNumericCellValue();
    }

    private double numericValueOrZero(Sheet sheet, int rowIndex, int columnIndex) {
        Double value = numericValue(sheet, rowIndex, columnIndex);
        return value == null ? 0.0 : value;
    }

    private String stringValue(Sheet sheet, int rowIndex, int columnIndex) {
        Row row = sheet.getRow(rowIndex);
        if (row == null) {
            return null;
        }

        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            return null;
        }

        return cell.getStringCellValue();
    }

    private String findStringValueAfterLabel(Sheet sheet, String label) {
        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cell.getCellType() == CellType.STRING && label.equals(cell.getStringCellValue())) {
                    Cell valueCell = row.getCell(cell.getColumnIndex() + 1);
                    return valueCell == null ? null : valueCell.getStringCellValue();
                }
            }
        }

        throw new AssertionError("Label not found in sheet: " + label);
    }
}
