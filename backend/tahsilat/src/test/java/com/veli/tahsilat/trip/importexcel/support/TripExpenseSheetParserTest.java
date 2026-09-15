package com.veli.tahsilat.trip.importexcel.support;

import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.trip.importexcel.dto.ParsedTripDailyExpenseRow;
import com.veli.tahsilat.trip.importexcel.dto.ParsedTripExpenseSheet;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
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
import static org.junit.jupiter.api.Assertions.assertThrows;

class TripExpenseSheetParserTest {

    private final TripExpenseSheetParser parser =
            new TripExpenseSheetParser(new XlsxFileValidator(), new TripSheetParseSupport());

    @Test
    void parsesRealFormLayoutWithFormulaDateSeriesAndSubstringSafeLabels() throws IOException {
        MockMultipartFile file = buildRealisticExpenseFile();

        ParsedTripExpenseSheet result = parser.parse(file);

        assertEquals("VELİ KARA", result.getSalesmanName());
        assertEquals("20 AIJ 672", result.getVehiclePlate());

        List<ParsedTripDailyExpenseRow> days = result.getDailyExpenses();
        assertEquals(3, days.size());

        assertEquals(LocalDate.of(2026, 8, 18), days.get(0).getExpenseDate());
        assertEquals(new BigDecimal("350.00"), days.get(0).getMealAmount());
        assertEquals(new BigDecimal("1500.00"), days.get(0).getHotelAmount());

        // Day 2's date is a "=B5+1"-style formula, not a literal date -
        // this is the real weekly file's own pattern and previously broke
        // parsing (FORMULA cell type wasn't handled).
        assertEquals(LocalDate.of(2026, 8, 19), days.get(1).getExpenseDate());
        assertEquals(LocalDate.of(2026, 8, 20), days.get(2).getExpenseDate());
    }

    @Test
    void missingMealRowIsRejected() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> parser.parse(buildEmptyFile())
        );

        assertEquals("Harcama dökümünde 'YEMEK BEDELİ' satırı bulunamadı.", exception.getMessage());
    }

    private MockMultipartFile buildEmptyFile() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            workbook.createSheet("Boş");
            return toMultipartFile(workbook, "empty.xlsx");
        }
    }

    /**
     * Mirrors the real weekly file's title/label placement closely enough
     * to exercise the two bugs found against the real data: a title cell
     * containing "SATIŞ PERSONELİ" as a substring (must not be mistaken
     * for the actual label/value pair), and day columns built with
     * "=previousCell+1" formulas instead of literal dates.
     */
    private MockMultipartFile buildRealisticExpenseFile() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("ÖN");

            setString(sheet, 0, 2, "DENOTO KOLL.ŞTİ.AİT SATIŞ PERSONELİ HARCAMA DÖKÜMANIDIR");
            setString(sheet, 1, 0, "ÖNEMLİ NOT: bu belge delil olarak kullanılacaktır.");

            setString(sheet, 2, 1, "DENİZLİ ÇIKIŞ KM.");
            setString(sheet, 2, 2, "ÇIKIŞ YAKIT TUTARI");
            setString(sheet, 2, 3, "SEY.ALINAN YAKIT");
            setString(sheet, 2, 4, "DENİZLİ GİRİŞ KM.");
            // row 3 (value row) intentionally left blank - matches the
            // real sample file where this week's km/fuel wasn't filled in.

            setString(sheet, 4, 0, "TARİH");
            setString(sheet, 4, 7, "TOPLAM");

            // Column B is a literal date; C/D are "=prev+1" formulas, same
            // as the real file's date-series pattern.
            setDateCell(sheet, 4, 1, LocalDate.of(2026, 8, 18));
            setFormula(sheet, 4, 2, "B5+1");
            setFormula(sheet, 4, 3, "C5+1");

            setString(sheet, 5, 0, "YEMEK BEDELİ");
            setNumeric(sheet, 5, 1, 350);
            setNumeric(sheet, 5, 2, 350);
            setNumeric(sheet, 5, 3, 350);

            setString(sheet, 6, 0, "TUTAR OTEL İSMİ / FATURA NO");
            setNumeric(sheet, 6, 1, 1500);

            setString(sheet, 8, 0, "TUTAR AL.FİRMA / FATURA NO");

            setString(sheet, 10, 0, "TUTAR FİRMA / AÇIKLAMA");

            setString(sheet, 12, 0, "AKŞAM OTELE GİRİŞ KM.");

            setString(sheet, 13, 0, "TOPLAM");

            setDate(sheet, 14, 1, LocalDate.of(2026, 8, 24));
            setString(sheet, 14, 2, "SATIŞ PERSONELİ");
            setString(sheet, 14, 3, "VELİ KARA");
            setString(sheet, 14, 5, "PLAKA");
            setString(sheet, 14, 6, "20 AIJ 672");

            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
            evaluator.evaluateAll();

            return toMultipartFile(workbook, "expense.xlsx");
        }
    }

    private void setString(Sheet sheet, int rowIndex, int col, String value) {
        Row row = getOrCreateRow(sheet, rowIndex);
        row.createCell(col).setCellValue(value);
    }

    private void setNumeric(Sheet sheet, int rowIndex, int col, double value) {
        Row row = getOrCreateRow(sheet, rowIndex);
        row.createCell(col).setCellValue(value);
    }

    private void setDate(Sheet sheet, int rowIndex, int col, LocalDate date) {
        setDateCell(sheet, rowIndex, col, date);
    }

    private void setDateCell(Sheet sheet, int rowIndex, int col, LocalDate date) {
        Row row = getOrCreateRow(sheet, rowIndex);
        Cell cell = row.createCell(col);
        cell.setCellValue(java.sql.Date.valueOf(date));
    }

    private void setFormula(Sheet sheet, int rowIndex, int col, String formula) {
        Row row = getOrCreateRow(sheet, rowIndex);
        row.createCell(col).setCellFormula(formula);
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
