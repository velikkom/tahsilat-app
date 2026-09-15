package com.veli.tahsilat.trip.importexcel.support;

import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.trip.importexcel.dto.ParsedTripCollectionRow;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class TripCollectionSheetParserTest {

    private final TripCollectionSheetParser parser =
            new TripCollectionSheetParser(new XlsxFileValidator(), new TripSheetParseSupport());

    @Test
    void parsesEachPaymentTypeFromItsOwnColumnGroup() throws IOException {
        MockMultipartFile file = buildRealisticCollectionFile();

        List<ParsedTripCollectionRow> rows = parser.parse(file);

        assertEquals(5, rows.size());

        ParsedTripCollectionRow cash = rows.get(0);
        assertEquals("KORKMAZ OTO", cash.getCustomerName());
        assertEquals(PaymentType.CASH, cash.getPaymentType());
        assertEquals(new BigDecimal("5000.00"), cash.getAmount());
        assertEquals("10609", cash.getReceiptNumber());

        ParsedTripCollectionRow promissoryNote = rows.get(1);
        assertEquals(PaymentType.PROMISSORY_NOTE, promissoryNote.getPaymentType());
        assertEquals(new BigDecimal("32000.00"), promissoryNote.getAmount());
        assertEquals(LocalDate.of(2026, 10, 30), promissoryNote.getMaturityDate());

        ParsedTripCollectionRow check = rows.get(2);
        assertEquals(PaymentType.CHECK, check.getPaymentType());
        assertEquals("Ziraat Bankası", check.getBankName());
        assertEquals(new BigDecimal("8000.00"), check.getAmount());

        // Real form's mailorder block is a generic FİRMA + TUTAR pair, not
        // a fixed Karland/Otokoç split - the firma name is free text.
        ParsedTripCollectionRow mailOrder = rows.get(3);
        assertEquals(PaymentType.MAIL_ORDER, mailOrder.getPaymentType());
        assertEquals("BAŞBUĞ", mailOrder.getMailOrderCompany());
        assertEquals(new BigDecimal("12000.00"), mailOrder.getAmount());

        ParsedTripCollectionRow bankTransfer = rows.get(4);
        assertEquals(PaymentType.BANK_TRANSFER, bankTransfer.getPaymentType());
        assertEquals("Denizbank", bankTransfer.getBankName());
        assertEquals(new BigDecimal("3000.00"), bankTransfer.getAmount());
    }

    @Test
    void stopsAtFirstBlankUnvaniRowIgnoringNumberedPaddingRows() throws IOException {
        MockMultipartFile file = buildFileWithPaddingRows();

        List<ParsedTripCollectionRow> rows = parser.parse(file);

        // Row 2 (SIRA NO 2) has a bare SIRA NO and nothing else - the
        // paper form's padding pattern - and must not be read as data.
        assertEquals(1, rows.size());
        assertEquals("TEK MÜŞTERİ", rows.get(0).getCustomerName());
    }

    @Test
    void unsetOptionalColumnsStayNullRatherThanEmptyString() throws IOException {
        MockMultipartFile file = buildFileWithPaddingRows();

        List<ParsedTripCollectionRow> rows = parser.parse(file);

        assertNull(rows.get(0).getMikroSr());
        assertNull(rows.get(0).getMikroNo());
    }

    private MockMultipartFile buildRealisticCollectionFile() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("ARKA");

            setString(sheet, 0, 4, "TAHSİLAT DÖKÜMÜDÜR");
            setString(sheet, 1, 0, "SATIŞ PERSONELİ'NİN ADI / SOYADI : VELİ KARA");
            setString(sheet, 2, 0, "SIRA NO");

            addRow(sheet, 4, 1, "10609", null, null, "KORKMAZ OTO", LocalDate.of(2026, 8, 18),
                    "5000", null, null, null, null, null, null, null, null, null, null, null);

            addRow(sheet, 5, 2, "10611", null, null, "ARAP OTO", LocalDate.of(2026, 8, 18),
                    null, "30.10.2026", "32000", null, null, null, null, null, null, null, null, null);

            addRow(sheet, 6, 3, "10612", null, null, "ÇEK MÜŞTERİSİ", LocalDate.of(2026, 8, 19),
                    null, null, null, "Ziraat Bankası", "30.09.2026", "8000", null, null, null, null, null, null);

            addRow(sheet, 7, 4, "10615", null, null, "ALİOĞLU OTOMOTİV", LocalDate.of(2026, 8, 18),
                    null, null, null, null, null, null, "BAŞBUĞ", "12000", null, null, null, null);

            addRow(sheet, 8, 5, "10620", null, null, "HAVALE MÜŞTERİSİ", LocalDate.of(2026, 8, 20),
                    null, null, null, null, null, null, null, null, "Denizbank", "3000", null, null);

            return toMultipartFile(workbook, "collection.xlsx");
        }
    }

    private MockMultipartFile buildFileWithPaddingRows() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("ARKA");

            setString(sheet, 0, 4, "TAHSİLAT DÖKÜMÜDÜR");

            addRow(sheet, 4, 1, "1000", null, null, "TEK MÜŞTERİ", LocalDate.of(2026, 8, 18),
                    "1000", null, null, null, null, null, null, null, null, null, null, null);

            // Padding row: bare SIRA NO, everything else blank - must stop
            // the scan here, not be read as a second data row.
            setNumeric(sheet, 5, 0, 2);

            return toMultipartFile(workbook, "collection.xlsx");
        }
    }

    private void addRow(
            Sheet sheet,
            int rowIndex,
            int siraNo,
            String makbuzNo,
            String mikroSr,
            String mikroNo,
            String unvani,
            LocalDate tarih,
            String nakit,
            String senetVade,
            String senetTutar,
            String cekBanka,
            String cekVade,
            String cekTutar,
            String mailorderFirma,
            String mailorderTutar,
            String havaleBanka,
            String havaleTutar,
            String posYkb,
            String posTeb
    ) {
        Row row = getOrCreateRow(sheet, rowIndex);
        row.createCell(0).setCellValue(siraNo);
        setIfPresent(row, 1, makbuzNo);
        setIfPresent(row, 2, mikroSr);
        setIfPresent(row, 3, mikroNo);
        setIfPresent(row, 4, unvani);
        row.createCell(5).setCellValue(java.sql.Date.valueOf(tarih));
        setIfPresent(row, 6, nakit);
        setIfPresent(row, 7, senetVade);
        setIfPresent(row, 8, senetTutar);
        setIfPresent(row, 9, cekBanka);
        setIfPresent(row, 10, cekVade);
        setIfPresent(row, 11, cekTutar);
        setIfPresent(row, 12, mailorderFirma);
        setIfPresent(row, 13, mailorderTutar);
        setIfPresent(row, 14, havaleBanka);
        setIfPresent(row, 15, havaleTutar);
        setIfPresent(row, 16, posYkb);
        setIfPresent(row, 17, posTeb);
    }

    private void setIfPresent(Row row, int column, String value) {
        if (value != null) {
            row.createCell(column).setCellValue(value);
        }
    }

    private void setString(Sheet sheet, int rowIndex, int col, String value) {
        getOrCreateRow(sheet, rowIndex).createCell(col).setCellValue(value);
    }

    private void setNumeric(Sheet sheet, int rowIndex, int col, double value) {
        getOrCreateRow(sheet, rowIndex).createCell(col).setCellValue(value);
    }

    private Row getOrCreateRow(Sheet sheet, int rowIndex) {
        Row row = sheet.getRow(rowIndex);
        return row == null ? sheet.createRow(rowIndex) : row;
    }

    private MockMultipartFile toMultipartFile(Workbook workbook, String filename) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);

        return new MockMultipartFile(
                "file",
                filename,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                outputStream.toByteArray()
        );
    }
}
