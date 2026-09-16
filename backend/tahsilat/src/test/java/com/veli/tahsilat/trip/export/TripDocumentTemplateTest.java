package com.veli.tahsilat.trip.export;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Guards the shipped template against accidental edits. Every coordinate in
 * {@link TripDocumentTemplate} is asserted here, so re-saving the workbook in
 * Excel and shifting a row breaks the build instead of the generated document.
 */
class TripDocumentTemplateTest {

    private final TripDocumentTemplate template = new TripDocumentTemplate();

    @Test
    void templateHasBothSheets() throws IOException {
        try (XSSFWorkbook workbook = template.load()) {
            assertNotNull(workbook.getSheet(TripDocumentTemplate.SHEET_ON));
            assertNotNull(workbook.getSheet(TripDocumentTemplate.SHEET_ARKA));
            assertEquals(2, workbook.getNumberOfSheets());
        }
    }

    @Test
    void arkaLabelsSitAtExpectedCoordinates() throws IOException {
        try (XSSFWorkbook workbook = template.load()) {
            Sheet arka = workbook.getSheet(TripDocumentTemplate.SHEET_ARKA);

            assertTrue(string(arka, 1, 0).startsWith("SATIŞ PERSONELİ"));
            assertEquals("SIRA NO", string(arka, 2, TripDocumentTemplate.Arka.COL_SIRA_NO));
            assertEquals("ÜNVANI", string(arka, 2, TripDocumentTemplate.Arka.COL_CUSTOMER_NAME));
            assertEquals("TARİH", string(arka, 2, TripDocumentTemplate.Arka.COL_DATE));
            assertEquals("TUTARI", string(arka, 3, TripDocumentTemplate.Arka.COL_CASH));
            assertEquals("VADE TARİHİ", string(arka, 3, TripDocumentTemplate.Arka.COL_NOTE_MATURITY));
            assertEquals("BANKA ADI", string(arka, 3, TripDocumentTemplate.Arka.COL_CHECK_BANK));
            assertEquals("FİRMA", string(arka, 3, TripDocumentTemplate.Arka.COL_MAILORDER_COMPANY));
            assertEquals("BANKA", string(arka, 3, TripDocumentTemplate.Arka.COL_TRANSFER_BANK));
            assertEquals("YKB", string(arka, 3, TripDocumentTemplate.Arka.COL_POS_YKB));
            assertEquals("TEB", string(arka, 3, TripDocumentTemplate.Arka.COL_POS_TEB));
            assertEquals("GENEL TOPLAM", string(arka, TripDocumentTemplate.Arka.ROW_TOTALS, 0));
        }
    }

    @Test
    void arkaKeepsPreNumberedRowsAndNoSampleData() throws IOException {
        try (XSSFWorkbook workbook = template.load()) {
            Sheet arka = workbook.getSheet(TripDocumentTemplate.SHEET_ARKA);

            for (int i = 0; i < TripDocumentTemplate.Arka.DATA_ROW_CAPACITY; i++) {
                int rowIndex = TripDocumentTemplate.Arka.FIRST_DATA_ROW + i;

                Cell siraNo = cell(arka, rowIndex, TripDocumentTemplate.Arka.COL_SIRA_NO);
                assertNotNull(siraNo, "SIRA NO eksik: satır " + (rowIndex + 1));
                assertEquals(i + 1, (int) siraNo.getNumericCellValue());

                for (int col = TripDocumentTemplate.Arka.COL_RECEIPT_NUMBER;
                     col <= TripDocumentTemplate.Arka.COL_POS_TEB; col++) {
                    assertNull(
                            string(arka, rowIndex, col),
                            "Şablonda örnek veri kalmış: satır " + (rowIndex + 1) + " kolon " + col
                    );
                }
            }
        }
    }

    @Test
    void arkaTotalsRowKeepsItsOwnFormulas() throws IOException {
        try (XSSFWorkbook workbook = template.load()) {
            Sheet arka = workbook.getSheet(TripDocumentTemplate.SHEET_ARKA);
            int row = TripDocumentTemplate.Arka.ROW_TOTALS;

            assertEquals("SUM(G5:G34)", formula(arka, row, TripDocumentTemplate.Arka.COL_CASH));
            assertEquals("SUM(I5:I34)", formula(arka, row, TripDocumentTemplate.Arka.COL_NOTE_MATURITY));
            assertEquals("SUM(L5:L34)", formula(arka, row, TripDocumentTemplate.Arka.COL_CHECK_BANK));
            assertEquals("SUM(M5:M34)", formula(arka, row, TripDocumentTemplate.Arka.COL_MAILORDER_COMPANY));
            assertEquals("SUM(P5:P34)", formula(arka, row, TripDocumentTemplate.Arka.COL_TRANSFER_BANK));

            assertBlank(arka, row, TripDocumentTemplate.Arka.COL_MAILORDER_AMOUNT);
            assertBlank(arka, row, TripDocumentTemplate.Arka.COL_POS_YKB);
            assertBlank(arka, row, TripDocumentTemplate.Arka.COL_POS_TEB);
        }
    }

    @Test
    void onLabelsSitAtExpectedCoordinates() throws IOException {
        try (XSSFWorkbook workbook = template.load()) {
            Sheet on = workbook.getSheet(TripDocumentTemplate.SHEET_ON);

            assertEquals("DENİZLİ ÇIKIŞ KM.", string(on, 2, TripDocumentTemplate.On.COL_EXIT_KM));
            assertEquals("DENİZLİ GİRİŞ KM.", string(on, 2, TripDocumentTemplate.On.COL_ENTRY_KM));
            assertEquals("TOPLAM KM", string(on, 2, TripDocumentTemplate.On.COL_TOTAL_KM));

            assertEquals("TARİH", string(on, TripDocumentTemplate.On.ROW_DAYS, 0));
            assertEquals("YEMEK BEDELİ", string(on, TripDocumentTemplate.On.ROW_MEAL, 0));
            assertTrue(string(on, TripDocumentTemplate.On.ROW_HOTEL_AMOUNT, 0).contains("OTEL İSMİ"));
            assertTrue(string(on, TripDocumentTemplate.On.ROW_FUEL_AMOUNT, 0).contains("AL.FİRMA"));
            assertTrue(string(on, TripDocumentTemplate.On.ROW_OTHER_AMOUNT, 0).contains("AÇIKLAMA"));
            assertEquals("AKŞAM OTELE GİRİŞ KM.", string(on, TripDocumentTemplate.On.ROW_EVENING_HOTEL_KM, 0));
            assertEquals("TOPLAM", string(on, TripDocumentTemplate.On.ROW_DAILY_TOTAL, 0));

            assertEquals("SATIŞ PERSONELİ", string(on, TripDocumentTemplate.On.ROW_HEADER, 2));
            assertEquals("PLAKA", string(on, TripDocumentTemplate.On.ROW_HEADER, 5));

            assertEquals("ALDIĞI HAFTALIK", string(on, TripDocumentTemplate.On.ROW_WEEKLY_ALLOWANCE, 3));
            assertEquals("FAZLADAN ALDIĞI", string(on, TripDocumentTemplate.On.ROW_EXTRA_RECEIVED, 3));
            assertEquals("ALDIĞI AGİ", string(on, TripDocumentTemplate.On.ROW_AGI_RECEIVED, 3));
            assertEquals("KALAN NAKİT", string(on, 21, 3));
            assertEquals(
                    "PİRİMDEN DÜŞÜLECEK TAHSİLAT",
                    string(on, 15, TripDocumentTemplate.On.COL_COMMISSION_EXCLUDED)
            );
        }
    }

    @Test
    void onKeepsDateChainAndTotalFormulas() throws IOException {
        try (XSSFWorkbook workbook = template.load()) {
            Sheet on = workbook.getSheet(TripDocumentTemplate.SHEET_ON);
            int dayRow = TripDocumentTemplate.On.ROW_DAYS;

            assertBlank(on, dayRow, TripDocumentTemplate.On.FIRST_DAY_COL);
            assertEquals("B5+1", formula(on, dayRow, 2));
            assertEquals("C5+1", formula(on, dayRow, 3));
            assertEquals("D5+1", formula(on, dayRow, 4));
            assertEquals("E5+1", formula(on, dayRow, 5));
            assertEquals("F5+1", formula(on, dayRow, 6));

            assertEquals("SUM(B6:G6)", formula(on, TripDocumentTemplate.On.ROW_MEAL, TripDocumentTemplate.On.COL_ROW_TOTAL));
            assertEquals("SUM(B7:G7)", formula(on, TripDocumentTemplate.On.ROW_HOTEL_AMOUNT, TripDocumentTemplate.On.COL_ROW_TOTAL));
            assertEquals("B6+B7+B9+B11", formula(on, TripDocumentTemplate.On.ROW_DAILY_TOTAL, 1));
        }
    }

    @Test
    void onPullsCollectionTotalsFromArkaSheet() throws IOException {
        try (XSSFWorkbook workbook = template.load()) {
            Sheet on = workbook.getSheet(TripDocumentTemplate.SHEET_ON);

            assertEquals("ARKA!G35", formula(on, 16, 1));
            assertEquals("ARKA!H35", formula(on, 17, 1));
            assertEquals("ARKA!J35", formula(on, 18, 1));
            assertEquals("ARKA!M35", formula(on, 19, 1));
            assertEquals("ARKA!N35", formula(on, 20, 1));
            assertEquals("ARKA!Q35", formula(on, 21, 1));
            assertEquals("ARKA!R35", formula(on, 22, 1));
            assertEquals("ARKA!O35", formula(on, 23, 1));

            assertEquals("SUM(B17:B24)", formula(on, 24, 1));
            assertEquals("B25-SUM(C17:C24)", formula(on, 25, 1));
            assertEquals("B26/1.2*1%", formula(on, 26, 1));

            assertEquals("B17", formula(on, 15, TripDocumentTemplate.On.COL_RECONCILIATION_VALUE));
            assertEquals("H14", formula(on, 16, TripDocumentTemplate.On.COL_RECONCILIATION_VALUE));
            assertEquals("B27", formula(on, 18, TripDocumentTemplate.On.COL_RECONCILIATION_VALUE));
            assertEquals(
                    "E16-E17-E18-E19-E20-E21",
                    formula(on, 21, TripDocumentTemplate.On.COL_RECONCILIATION_VALUE)
            );

            assertEquals("COUNTA(ARKA!J5:J34)", formula(on, 26, 3));
            assertEquals("COUNTA(ARKA!I5:I34)", formula(on, 27, 3));
        }
    }

    @Test
    void mergedRegionsSurvive() throws IOException {
        try (XSSFWorkbook workbook = template.load()) {
            assertMerged(workbook.getSheet(TripDocumentTemplate.SHEET_ARKA), "A2:E2");
            assertMerged(workbook.getSheet(TripDocumentTemplate.SHEET_ARKA), "N2:O2");
            assertMerged(workbook.getSheet(TripDocumentTemplate.SHEET_ARKA), "A35:E35");

            assertMerged(workbook.getSheet(TripDocumentTemplate.SHEET_ON), "D15:E15");
            assertMerged(workbook.getSheet(TripDocumentTemplate.SHEET_ON), "G15:H15");
            assertMerged(workbook.getSheet(TripDocumentTemplate.SHEET_ON), "A7:A8");
            assertMerged(workbook.getSheet(TripDocumentTemplate.SHEET_ON), "H11:H12");
        }
    }

    @Test
    void templateCarriesNoExternalLinks() throws IOException {
        try (XSSFWorkbook workbook = template.load()) {
            assertEquals(0, workbook.getExternalLinksTable().size());
        }
    }

    /**
     * Clearing a cell in Excel keeps the styled but empty cell in the file, so
     * emptiness is asserted on the value rather than on the cell's absence.
     */
    private static void assertBlank(Sheet sheet, int rowIndex, int columnIndex) {
        Cell cell = cell(sheet, rowIndex, columnIndex);

        if (cell == null) {
            return;
        }

        assertEquals(
                CellType.BLANK,
                cell.getCellType(),
                "Şablonda veri kalmış: satır " + (rowIndex + 1) + " kolon " + columnIndex
        );
    }

    private static void assertMerged(Sheet sheet, String reference) {
        boolean found = sheet.getMergedRegions().stream()
                .map(CellRangeAddress::formatAsString)
                .anyMatch(reference::equals);

        assertTrue(found, "Birleştirme kaybolmuş: " + reference);
    }

    private static Cell cell(Sheet sheet, int rowIndex, int columnIndex) {
        Row row = sheet.getRow(rowIndex);
        return row == null ? null : row.getCell(columnIndex);
    }

    private static String string(Sheet sheet, int rowIndex, int columnIndex) {
        Cell cell = cell(sheet, rowIndex, columnIndex);

        if (cell == null || cell.getCellType() != CellType.STRING) {
            return null;
        }

        String value = cell.getStringCellValue().trim();
        return value.isEmpty() ? null : value;
    }

    private static String formula(Sheet sheet, int rowIndex, int columnIndex) {
        Cell cell = cell(sheet, rowIndex, columnIndex);

        if (cell == null || cell.getCellType() != CellType.FORMULA) {
            return null;
        }

        return cell.getCellFormula();
    }
}
