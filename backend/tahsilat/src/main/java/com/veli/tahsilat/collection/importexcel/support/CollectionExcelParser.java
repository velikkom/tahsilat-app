package com.veli.tahsilat.collection.importexcel.support;

import com.veli.tahsilat.collection.importexcel.dto.ParsedCollectionImportRow;
import com.veli.tahsilat.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CollectionExcelParser {

    private static final long MAX_FILE_SIZE_BYTES = 2L * 1024 * 1024;
    private static final int MAX_DATA_ROWS = 5000;
    private static final byte[] XLSX_MAGIC_BYTES = {0x50, 0x4B};

    private final CollectionExcelParseSupport parseSupport;

    public List<ParsedCollectionImportRow> parse(MultipartFile file) {
        validateFile(file);

        try (
                InputStream inputStream = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(inputStream)
        ) {
            Sheet sheet = workbook.getSheetAt(0);

            if (sheet.getLastRowNum() > MAX_DATA_ROWS) {
                throw new BusinessException(
                        "İçe aktarılacak satır sayısı çok fazla. Maksimum "
                                + MAX_DATA_ROWS + " satır desteklenir."
                );
            }

            List<ParsedCollectionImportRow> rows = new ArrayList<>();
            boolean firstRow = true;

            for (Row row : sheet) {
                if (firstRow) {
                    firstRow = false;
                    continue;
                }

                if (parseSupport.isRowEmpty(row)) {
                    continue;
                }

                rows.add(
                        ParsedCollectionImportRow.builder()
                                .rowNumber(row.getRowNum() + 1)
                                .collectionDate(
                                        parseSupport.parseDate(row.getCell(1))
                                )
                                .customerName(
                                        parseSupport.getCellString(row.getCell(2))
                                )
                                .paymentType(
                                        parseSupport.mapPaymentType(
                                                parseSupport.getCellString(row.getCell(3))
                                        )
                                )
                                .amount(parseSupport.parseAmount(row.getCell(4)))
                                .maturityDate(
                                        parseSupport.parseDate(row.getCell(5))
                                )
                                .build()
                );
            }

            return rows;
        } catch (BusinessException exception) {
            throw exception;
        } catch (Exception exception) {
            log.error("Excel parse failed", exception);
            throw new BusinessException("Excel dosyası okunamadı.");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Excel dosyası seçilmedi.");
        }

        String filename = file.getOriginalFilename();

        if (filename == null || !filename.toLowerCase().endsWith(".xlsx")) {
            throw new BusinessException("Yalnızca .xlsx dosyaları desteklenir.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BusinessException("Dosya boyutu çok büyük. Maksimum 2MB desteklenir.");
        }

        if (!hasXlsxSignature(file)) {
            throw new BusinessException("Dosya içeriği geçerli bir Excel (.xlsx) dosyası değil.");
        }
    }

    private boolean hasXlsxSignature(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = inputStream.readNBytes(XLSX_MAGIC_BYTES.length);
            return Arrays.equals(header, XLSX_MAGIC_BYTES);
        } catch (IOException exception) {
            return false;
        }
    }
}
