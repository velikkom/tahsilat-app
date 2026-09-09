package com.veli.tahsilat.collection.importexcel.support;

import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.importexcel.dto.ParsedCollectionImportRow;
import com.veli.tahsilat.common.exception.BusinessException;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CollectionExcelParserTest {

    private static final String XLSX_CONTENT_TYPE =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private final CollectionExcelParser parser =
            new CollectionExcelParser(new CollectionExcelParseSupport());

    @Test
    void emptyFileIsRejected() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.xlsx", XLSX_CONTENT_TYPE, new byte[0]
        );

        BusinessException exception = assertThrows(BusinessException.class, () -> parser.parse(file));
        assertEquals("Excel dosyası seçilmedi.", exception.getMessage());
    }

    @Test
    void xlsxExtensionWithNonXlsxContentIsRejectedAsSpoofed() {
        byte[] fakeContent = "not a real excel file".getBytes(StandardCharsets.UTF_8);
        MockMultipartFile file = new MockMultipartFile(
                "file", "fake.xlsx", XLSX_CONTENT_TYPE, fakeContent
        );

        BusinessException exception = assertThrows(BusinessException.class, () -> parser.parse(file));
        assertTrue(exception.getMessage().contains("geçerli bir Excel"));
    }

    @Test
    void fileLargerThanMaxSizeIsRejected() {
        byte[] oversized = new byte[2 * 1024 * 1024 + 1];
        MockMultipartFile file = new MockMultipartFile(
                "file", "big.xlsx", XLSX_CONTENT_TYPE, oversized
        );

        BusinessException exception = assertThrows(BusinessException.class, () -> parser.parse(file));
        assertTrue(exception.getMessage().contains("büyük"));
    }

    @Test
    void rowCountAboveCapIsRejected() throws IOException {
        byte[] workbookBytes = buildWorkbookWithRowCount(5002); // header + 5001 data rows
        MockMultipartFile file = new MockMultipartFile(
                "file", "toobig.xlsx", XLSX_CONTENT_TYPE, workbookBytes
        );

        BusinessException exception = assertThrows(BusinessException.class, () -> parser.parse(file));
        assertTrue(exception.getMessage().contains("satır sayısı çok fazla"));
    }

    @Test
    void corruptedZipWithValidMagicBytesFailsWithGenericMessageOnly() throws IOException {
        byte[] validBytes = buildWorkbookWithRowCount(1);
        byte[] corrupted = Arrays.copyOf(validBytes, 20); // keeps "PK" header, breaks zip structure

        MockMultipartFile file = new MockMultipartFile(
                "file", "corrupt.xlsx", XLSX_CONTENT_TYPE, corrupted
        );

        BusinessException exception = assertThrows(BusinessException.class, () -> parser.parse(file));
        assertEquals("Excel dosyası okunamadı.", exception.getMessage());
        assertFalse(exception.getMessage().toLowerCase().contains("poi"));
        assertFalse(exception.getMessage().toLowerCase().contains("zip"));
    }

    @Test
    void validSmallWorkbookStillParsesSuccessfully() throws IOException {
        byte[] workbookBytes = buildValidCollectionWorkbook();
        MockMultipartFile file = new MockMultipartFile(
                "file", "valid.xlsx", XLSX_CONTENT_TYPE, workbookBytes
        );

        List<ParsedCollectionImportRow> rows = parser.parse(file);

        assertEquals(1, rows.size());
        assertEquals("Test Musteri", rows.get(0).getCustomerName());
        assertEquals(PaymentType.CASH, rows.get(0).getPaymentType());
    }

    private byte[] buildWorkbookWithRowCount(int totalRows) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Sheet1");
            for (int i = 0; i < totalRows; i++) {
                sheet.createRow(i);
            }
            return toBytes(workbook);
        }
    }

    private byte[] buildValidCollectionWorkbook() throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Sheet1");
            sheet.createRow(0); // header row, skipped by parser

            Row dataRow = sheet.createRow(1);
            dataRow.createCell(1).setCellValue("01.01.2026");
            dataRow.createCell(2).setCellValue("Test Musteri");
            dataRow.createCell(3).setCellValue("Nakit");
            dataRow.createCell(4).setCellValue(100.50);

            return toBytes(workbook);
        }
    }

    private byte[] toBytes(XSSFWorkbook workbook) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        return out.toByteArray();
    }
}
