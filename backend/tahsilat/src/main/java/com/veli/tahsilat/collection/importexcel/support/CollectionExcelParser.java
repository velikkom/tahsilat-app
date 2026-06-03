package com.veli.tahsilat.collection.importexcel.support;

import com.veli.tahsilat.collection.importexcel.dto.ParsedCollectionImportRow;
import com.veli.tahsilat.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CollectionExcelParser {

    private final CollectionExcelParseSupport parseSupport;

    public List<ParsedCollectionImportRow> parse(MultipartFile file) {
        validateFile(file);

        try (
                InputStream inputStream = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(inputStream)
        ) {
            Sheet sheet = workbook.getSheetAt(0);
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
            throw new BusinessException(
                    "Excel dosyası okunamadı: " + exception.getMessage()
            );
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
    }
}
