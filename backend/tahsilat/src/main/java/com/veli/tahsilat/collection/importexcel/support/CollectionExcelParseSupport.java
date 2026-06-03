package com.veli.tahsilat.collection.importexcel.support;

import com.veli.tahsilat.collection.enums.PaymentType;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
public class CollectionExcelParseSupport {

    public LocalDate parseDate(Cell cell) {
        if (cell == null) {
            return null;
        }

        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return cell.getDateCellValue()
                        .toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate();
            }

            if (cell.getCellType() == CellType.STRING) {
                String value = cell.getStringCellValue().trim();

                if (value.isBlank()) {
                    return null;
                }

                DateTimeFormatter formatter =
                        DateTimeFormatter.ofPattern("dd.MM.yyyy");

                return LocalDate.parse(value, formatter);
            }
        } catch (Exception exception) {
            log.warn("Date parse failed for cell: {}", cell);
        }

        return null;
    }

    public String getCellString(Cell cell) {
        if (cell == null) {
            return "";
        }

        return cell.toString().trim();
    }

    public BigDecimal parseAmount(Cell cell) {
        if (cell == null) {
            return null;
        }

        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return BigDecimal.valueOf(cell.getNumericCellValue())
                        .setScale(2, RoundingMode.HALF_UP);
            }

            String value = cell.getStringCellValue()
                    .replace("₺", "")
                    .replace(" ", "")
                    .replace(".", "")
                    .replace(",", ".")
                    .trim();

            if (value.isBlank()) {
                return null;
            }

            return new BigDecimal(value).setScale(2, RoundingMode.HALF_UP);
        } catch (Exception exception) {
            log.warn("Amount parse failed for cell: {}", cell);
            return null;
        }
    }

    public PaymentType mapPaymentType(String value) {
        String normalized = normalize(value);

        return switch (normalized) {
            case "nakit" -> PaymentType.CASH;
            case "musteri ceki" -> PaymentType.CHECK;
            case "musteri senedi" -> PaymentType.PROMISSORY_NOTE;
            case "havale" -> PaymentType.BANK_TRANSFER;
            default -> PaymentType.CREDIT_CARD;
        };
    }

    public boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }

        for (int cellIndex = 1; cellIndex <= 5; cellIndex++) {
            Cell cell = row.getCell(cellIndex);

            if (cell != null && !getCellString(cell).isBlank()) {
                return false;
            }
        }

        return true;
    }

    public String normalize(String value) {
        if (value == null) {
            return "";
        }

        return value
                .toLowerCase()
                .replace("ı", "i")
                .replace("İ", "i")
                .replace("ş", "s")
                .replace("Ş", "s")
                .replace("ğ", "g")
                .replace("Ğ", "g")
                .replace("ü", "u")
                .replace("Ü", "u")
                .replace("ö", "o")
                .replace("Ö", "o")
                .replace("ç", "c")
                .replace("Ç", "c")
                .replace("?", "")
                .replace("�", "")
                .replace("san.", "san")
                .replace("tic.", "tic")
                .replace("ltd.", "ltd")
                .replace("şti.", "sti")
                .replace(".", " ")
                .replace(",", " ")
                .replace("-", " ")
                .replace("/", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
