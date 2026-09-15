package com.veli.tahsilat.trip.importexcel.support;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Cell-parsing helpers shared by TripExpenseSheetParser and
 * TripCollectionSheetParser - same parsing rules as
 * CollectionExcelParseSupport (numeric-or-dd.MM.yyyy dates, TRY-formatted
 * amounts) plus label-lookup helpers for the real paper form's irregular
 * (non-fixed-row) layout.
 */
@Slf4j
@Component
public class TripSheetParseSupport {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    public String getCellString(Cell cell) {
        if (cell == null) {
            return "";
        }

        // Receipt/mikro numbers are stored as plain numeric cells in the
        // real form (e.g. 10609) - cell.toString() would render these as
        // "10609.0". Format whole numbers without the decimal point.
        if (cell.getCellType() == CellType.NUMERIC) {
            double numericValue = cell.getNumericCellValue();

            if (numericValue == Math.rint(numericValue) && !Double.isInfinite(numericValue)) {
                return String.valueOf((long) numericValue);
            }
        }

        return cell.toString().trim();
    }

    public boolean isBlank(Cell cell) {
        return getCellString(cell).isBlank();
    }

    public LocalDate parseDate(Cell cell) {
        if (cell == null) {
            return null;
        }

        try {
            if (cell.getCellType() == CellType.NUMERIC || cell.getCellType() == CellType.FORMULA) {
                // getDateCellValue() also works for FORMULA cells whose
                // cached result is numeric (e.g. "=B5+1" date-series
                // formulas the real weekly file uses for its day columns).
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

                return LocalDate.parse(value, DATE_FORMATTER);
            }
        } catch (Exception exception) {
            log.warn("Date parse failed for cell: {}", cell);
        }

        return null;
    }

    public BigDecimal parseAmount(Cell cell) {
        if (cell == null) {
            return null;
        }

        try {
            if (cell.getCellType() == CellType.NUMERIC || cell.getCellType() == CellType.FORMULA) {
                // getNumericCellValue() also works for FORMULA cells whose
                // cached result is numeric (e.g. TOPLAM/sum formulas).
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

    public Integer parseInteger(Cell cell) {
        BigDecimal amount = parseAmount(cell);
        return amount == null ? null : amount.intValue();
    }

    /**
     * Turkish-folding, case-insensitive "does this cell's text contain
     * needle" check - used to locate label cells in the paper form's
     * irregular layout (merged multi-line labels, variable blank-row
     * padding) rather than relying on fixed row/column offsets.
     */
    public boolean cellContains(Cell cell, String needle) {
        return normalize(getCellString(cell)).contains(normalize(needle));
    }

    /**
     * Exact (post-normalization) match - unlike cellContains, this will
     * NOT match a longer sentence that happens to contain the needle (the
     * sheet title itself contains "SATIŞ PERSONELİ" as a substring, for
     * example). Used for standalone label cells.
     */
    public boolean cellEquals(Cell cell, String needle) {
        return normalize(getCellString(cell)).equals(normalize(needle));
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        return value
                .toUpperCase(Locale.forLanguageTag("tr-TR"))
                .replace('İ', 'I')
                .replace('I', 'I')
                .replaceAll("\\s+", " ")
                .trim();
    }

    /**
     * Scans the whole sheet for a cell whose text exactly equals labelText
     * (not just contains it - the sheet title itself contains "SATIŞ
     * PERSONELİ" as a substring, so a contains-match would find that
     * instead of the real label cell) and returns the string value of the
     * cell immediately to its right. Used for free-floating label/value
     * pairs (SATIŞ PERSONELİ, PLAKA) whose row/column position isn't
     * fixed.
     */
    public String findValueRightOfLabel(Sheet sheet, String labelText) {
        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cellEquals(cell, labelText)) {
                    Cell valueCell = row.getCell(cell.getColumnIndex() + 1);
                    String value = getCellString(valueCell);
                    return value.isBlank() ? null : value;
                }
            }
        }

        return null;
    }

    /**
     * Scans the whole sheet for the first row containing a cell whose text
     * contains labelText, returning that row's index (POI 0-based), or -1.
     */
    public int findRowIndexByLabel(Sheet sheet, String labelText) {
        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cellContains(cell, labelText)) {
                    return row.getRowNum();
                }
            }
        }

        return -1;
    }
}
