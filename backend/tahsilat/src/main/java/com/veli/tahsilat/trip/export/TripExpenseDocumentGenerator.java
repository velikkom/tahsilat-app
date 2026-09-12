package com.veli.tahsilat.trip.export;

import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.trip.entity.Trip;
import com.veli.tahsilat.trip.entity.TripDailyExpense;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Builds the Excel equivalent of the paper "DENOTO KOLL. STI. AIT SATIS
 * PERSONELI HARCAMA DOKUMANIDIR" form (Form 2) for a single trip.
 */
@Component
public class TripExpenseDocumentGenerator {

    private static final DateTimeFormatter DAY_FORMATTER =
            DateTimeFormatter.ofPattern("dd.MM.yyyy");

    public byte[] generate(
            Trip trip,
            Map<PaymentType, BigDecimal> collectionSumsByType
    ) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Form 2");
            sheet.getPrintSetup().setLandscape(true);
            sheet.setFitToPage(true);

            CellStyle titleStyle = boldStyle(workbook, 14);
            CellStyle labelStyle = boldStyle(workbook, 10);

            List<LocalDate> days = tripDays(trip);
            int lastColumn = Math.max(1, days.size());

            int rowIndex = 0;

            rowIndex = writeTitle(sheet, titleStyle, rowIndex, lastColumn);
            rowIndex = writeSalesmanRow(sheet, labelStyle, rowIndex, trip);
            rowIndex = writeVehicleRow(sheet, labelStyle, rowIndex, trip);
            rowIndex++;

            rowIndex = writeDailyExpenseTable(sheet, labelStyle, rowIndex, days, trip.getDailyExpenses());
            rowIndex++;

            int reconciliationStartRow = rowIndex;

            writeCollectionSummary(sheet, labelStyle, reconciliationStartRow, trip, collectionSumsByType);
            writeReconciliation(sheet, labelStyle, reconciliationStartRow, trip, days, collectionSumsByType);

            for (int col = 0; col <= lastColumn; col++) {
                sheet.autoSizeColumn(col);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new BusinessException("Harcama dokümanı oluşturulamadı.");
        }
    }

    private int writeTitle(Sheet sheet, CellStyle titleStyle, int rowIndex, int lastColumn) {
        Row titleRow = sheet.createRow(rowIndex);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("DENOTO KOLL. ŞTİ. AİT SATIŞ PERSONELİ HARCAMA DÖKÜMANIDIR");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, 0, lastColumn));
        return rowIndex + 1;
    }

    private int writeSalesmanRow(Sheet sheet, CellStyle labelStyle, int rowIndex, Trip trip) {
        String salesmanName = trip.getSalesman() == null
                ? null
                : (trip.getSalesman().getFirstName() + " " + trip.getSalesman().getLastName()).trim();

        Row row = sheet.createRow(rowIndex);
        writeLabelValue(row, labelStyle, 0, "SATIŞ PERSONELİ", salesmanName);

        return rowIndex + 1;
    }

    private int writeVehicleRow(Sheet sheet, CellStyle labelStyle, int rowIndex, Trip trip) {
        Integer totalKm = totalKm(trip);
        BigDecimal totalFuel = nvl(trip.getExitFuelAmount()).add(nvl(trip.getTripFuelAmount()));

        Row row = sheet.createRow(rowIndex);
        writeLabelValue(row, labelStyle, 0, "PLAKA", trip.getVehiclePlate());
        writeLabelValue(row, labelStyle, 2, "ÇIKIŞ KM", trip.getDenizliExitKm());
        writeLabelValue(row, labelStyle, 4, "GİRİŞ KM", trip.getDenizliEntryKm());
        writeLabelValue(row, labelStyle, 6, "ÇIKIŞ YAKIT", trip.getExitFuelAmount());
        writeLabelValue(row, labelStyle, 8, "YOL YAKIT", trip.getTripFuelAmount());
        writeLabelValue(row, labelStyle, 10, "TOPLAM KM", totalKm);
        writeLabelValue(row, labelStyle, 12, "TOPLAM YAKIT", totalFuel);
        writeLabelValue(row, labelStyle, 14, "ONAY", (String) null);

        return rowIndex + 1;
    }

    private int writeDailyExpenseTable(
            Sheet sheet,
            CellStyle labelStyle,
            int rowIndex,
            List<LocalDate> days,
            List<TripDailyExpense> dailyExpenses
    ) {
        Map<LocalDate, TripDailyExpense> byDate = new java.util.HashMap<>();
        for (TripDailyExpense expense : dailyExpenses) {
            byDate.put(expense.getExpenseDate(), expense);
        }

        int dateRow = rowIndex;
        int mealRow = rowIndex + 1;
        int hotelRow = rowIndex + 2;
        int fuelInvoiceRow = rowIndex + 3;
        int otherRow = rowIndex + 4;
        int eveningKmRow = rowIndex + 5;
        int totalRow = rowIndex + 6;

        setLabelCell(sheet, dateRow, 0, "TARİH", labelStyle);
        setLabelCell(sheet, mealRow, 0, "YEMEK", labelStyle);
        setLabelCell(sheet, hotelRow, 0, "OTEL", labelStyle);
        setLabelCell(sheet, fuelInvoiceRow, 0, "YAKIT FATURALARI", labelStyle);
        setLabelCell(sheet, otherRow, 0, "DİĞER", labelStyle);
        setLabelCell(sheet, eveningKmRow, 0, "AKŞAM OTELE GİRİŞ KM", labelStyle);
        setLabelCell(sheet, totalRow, 0, "TOPLAM", labelStyle);

        int column = 1;
        for (LocalDate day : days) {
            TripDailyExpense expense = byDate.get(day);

            setCell(sheet, dateRow, column, day.format(DAY_FORMATTER));
            setCell(sheet, mealRow, column, expense == null ? null : expense.getMealAmount());
            setCell(sheet, hotelRow, column, expense == null ? null : expense.getHotelAmount());
            setCell(sheet, fuelInvoiceRow, column, expense == null ? null : expense.getFuelInvoiceAmount());
            setCell(sheet, otherRow, column, expense == null ? null : expense.getOtherAmount());
            setCell(sheet, eveningKmRow, column, expense == null ? null : expense.getEveningHotelKm());

            BigDecimal dailyTotal = expense == null
                    ? BigDecimal.ZERO
                    : nvl(expense.getMealAmount())
                            .add(nvl(expense.getHotelAmount()))
                            .add(nvl(expense.getFuelInvoiceAmount()))
                            .add(nvl(expense.getOtherAmount()));

            setCell(sheet, totalRow, column, dailyTotal);

            column++;
        }

        return totalRow + 1;
    }

    private void writeCollectionSummary(
            Sheet sheet,
            CellStyle labelStyle,
            int startRow,
            Trip trip,
            Map<PaymentType, BigDecimal> collectionSumsByType
    ) {
        BigDecimal cash = sumFor(collectionSumsByType, PaymentType.CASH);
        BigDecimal promissoryNote = sumFor(collectionSumsByType, PaymentType.PROMISSORY_NOTE);
        BigDecimal check = sumFor(collectionSumsByType, PaymentType.CHECK);
        BigDecimal bankTransfer = sumFor(collectionSumsByType, PaymentType.BANK_TRANSFER);
        BigDecimal mailorderKarland = sumFor(collectionSumsByType, PaymentType.MAIL_ORDER_KARLAND);
        BigDecimal mailorderOtokoc = sumFor(collectionSumsByType, PaymentType.MAIL_ORDER_OTOKOC);
        BigDecimal posYkb = sumFor(collectionSumsByType, PaymentType.POS_YKB);
        BigDecimal posTeb = sumFor(collectionSumsByType, PaymentType.POS_TEB);

        BigDecimal genelToplam = cash
                .add(promissoryNote)
                .add(check)
                .add(bankTransfer)
                .add(mailorderKarland)
                .add(mailorderOtokoc)
                .add(posYkb)
                .add(posTeb);

        int row = startRow;
        row = writeLabelValueRow(sheet, labelStyle, row, 0, "NAKİT", cash);
        row = writeLabelValueRow(sheet, labelStyle, row, 0, "SENET", promissoryNote);
        row = writeLabelValueRow(sheet, labelStyle, row, 0, "ÇEK", check);
        row = writeLabelValueRow(sheet, labelStyle, row, 0, "HAVALE", bankTransfer);
        row = writeLabelValueRow(sheet, labelStyle, row, 0, "MAILORDER KARLAND", mailorderKarland);
        row = writeLabelValueRow(sheet, labelStyle, row, 0, "MAILORDER OTOKOÇ", mailorderOtokoc);
        row = writeLabelValueRow(sheet, labelStyle, row, 0, "POS YKB", posYkb);
        row = writeLabelValueRow(sheet, labelStyle, row, 0, "POS TEB", posTeb);
        row = writeLabelValueRow(sheet, labelStyle, row, 0, "GENEL TOPLAM", genelToplam);
        row = writeLabelValueRow(sheet, labelStyle, row, 0, "PRİM HAKEDİŞ", (BigDecimal) null);
        writeLabelValueRow(sheet, labelStyle, row, 0, "%1 ALDIĞI PRİM", nvl(trip.getCommissionReceived()));
    }

    private void writeReconciliation(
            Sheet sheet,
            CellStyle labelStyle,
            int startRow,
            Trip trip,
            List<LocalDate> days,
            Map<PaymentType, BigDecimal> collectionSumsByType
    ) {
        BigDecimal cash = sumFor(collectionSumsByType, PaymentType.CASH);
        BigDecimal expenseTotal = totalExpenses(trip.getDailyExpenses());
        BigDecimal weeklyAllowance = nvl(trip.getWeeklyAllowance());
        BigDecimal commissionReceived = nvl(trip.getCommissionReceived());
        BigDecimal extraReceived = nvl(trip.getExtraReceived());
        BigDecimal agiReceived = nvl(trip.getAgiReceived());

        BigDecimal remainingCash = cash
                .subtract(expenseTotal)
                .subtract(weeklyAllowance)
                .subtract(commissionReceived)
                .subtract(extraReceived)
                .subtract(agiReceived);

        int labelColumn = 4;
        int valueColumn = 5;

        int row = startRow;
        row = writeLabelValueRow(sheet, labelStyle, row, labelColumn, "NAKİT TAHSİLAT", cash, valueColumn);
        row = writeLabelValueRow(sheet, labelStyle, row, labelColumn, "MASRAF TOPLAMI", expenseTotal, valueColumn);
        row = writeLabelValueRow(sheet, labelStyle, row, labelColumn, "ALDIĞI HAFTALIK", weeklyAllowance, valueColumn);
        row = writeLabelValueRow(sheet, labelStyle, row, labelColumn, "ALDIĞI PRİM", commissionReceived, valueColumn);
        row = writeLabelValueRow(sheet, labelStyle, row, labelColumn, "FAZLADAN ALINAN", extraReceived, valueColumn);
        row = writeLabelValueRow(sheet, labelStyle, row, labelColumn, "ALDIĞI AGİ", agiReceived, valueColumn);
        row = writeLabelValueRow(sheet, labelStyle, row, labelColumn, "KALAN NAKİT", remainingCash, valueColumn);
        row++;
        row = writeLabelValueRow(sheet, labelStyle, row, labelColumn, "TESLİM ALAN", trip.getReceiverName(), valueColumn);
        row = writeLabelValueRow(sheet, labelStyle, row, labelColumn, "PERSONEL İMZASI", (String) null, valueColumn);
        writeLabelValueRow(sheet, labelStyle, row, labelColumn, "TESLİM ALAN İMZASI", (String) null, valueColumn);
    }

    private BigDecimal totalExpenses(List<TripDailyExpense> dailyExpenses) {
        BigDecimal total = BigDecimal.ZERO;

        for (TripDailyExpense expense : dailyExpenses) {
            total = total
                    .add(nvl(expense.getMealAmount()))
                    .add(nvl(expense.getHotelAmount()))
                    .add(nvl(expense.getFuelInvoiceAmount()))
                    .add(nvl(expense.getOtherAmount()));
        }

        return total;
    }

    private Integer totalKm(Trip trip) {
        if (trip.getDenizliExitKm() == null || trip.getDenizliEntryKm() == null) {
            return null;
        }

        return trip.getDenizliEntryKm() - trip.getDenizliExitKm();
    }

    private List<LocalDate> tripDays(Trip trip) {
        List<LocalDate> days = new java.util.ArrayList<>();
        LocalDate current = trip.getStartDate();

        while (!current.isAfter(trip.getEndDate())) {
            days.add(current);
            current = current.plusDays(1);
        }

        return days;
    }

    private BigDecimal sumFor(Map<PaymentType, BigDecimal> sums, PaymentType paymentType) {
        return nvl(sums.get(paymentType));
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private void writeLabelValue(Row row, CellStyle labelStyle, int column, String label, String value) {
        setLabelCell(row.getSheet(), row.getRowNum(), column, label, labelStyle);
        setCell(row.getSheet(), row.getRowNum(), column + 1, value);
    }

    private void writeLabelValue(Row row, CellStyle labelStyle, int column, String label, Integer value) {
        setLabelCell(row.getSheet(), row.getRowNum(), column, label, labelStyle);
        setCell(row.getSheet(), row.getRowNum(), column + 1, value);
    }

    private void writeLabelValue(Row row, CellStyle labelStyle, int column, String label, BigDecimal value) {
        setLabelCell(row.getSheet(), row.getRowNum(), column, label, labelStyle);
        setCell(row.getSheet(), row.getRowNum(), column + 1, value);
    }

    private int writeLabelValueRow(
            Sheet sheet,
            CellStyle labelStyle,
            int row,
            int labelColumn,
            String label,
            BigDecimal value
    ) {
        return writeLabelValueRow(sheet, labelStyle, row, labelColumn, label, value, labelColumn + 1);
    }

    private int writeLabelValueRow(
            Sheet sheet,
            CellStyle labelStyle,
            int row,
            int labelColumn,
            String label,
            BigDecimal value,
            int valueColumn
    ) {
        setLabelCell(sheet, row, labelColumn, label, labelStyle);
        setCell(sheet, row, valueColumn, value);
        return row + 1;
    }

    private int writeLabelValueRow(
            Sheet sheet,
            CellStyle labelStyle,
            int row,
            int labelColumn,
            String label,
            String value,
            int valueColumn
    ) {
        setLabelCell(sheet, row, labelColumn, label, labelStyle);
        setCell(sheet, row, valueColumn, value);
        return row + 1;
    }

    private void setLabelCell(Sheet sheet, int rowIndex, int column, String label, CellStyle labelStyle) {
        Row row = sheet.getRow(rowIndex);
        if (row == null) {
            row = sheet.createRow(rowIndex);
        }

        Cell cell = row.createCell(column);
        cell.setCellValue(label);
        cell.setCellStyle(labelStyle);
    }

    private void setCell(Sheet sheet, int rowIndex, int column, String value) {
        if (value == null) {
            return;
        }

        Row row = sheet.getRow(rowIndex);
        if (row == null) {
            row = sheet.createRow(rowIndex);
        }

        row.createCell(column).setCellValue(value);
    }

    private void setCell(Sheet sheet, int rowIndex, int column, BigDecimal value) {
        if (value == null) {
            return;
        }

        Row row = sheet.getRow(rowIndex);
        if (row == null) {
            row = sheet.createRow(rowIndex);
        }

        row.createCell(column).setCellValue(value.doubleValue());
    }

    private void setCell(Sheet sheet, int rowIndex, int column, Integer value) {
        if (value == null) {
            return;
        }

        Row row = sheet.getRow(rowIndex);
        if (row == null) {
            row = sheet.createRow(rowIndex);
        }

        row.createCell(column).setCellValue(value);
    }

    private CellStyle boldStyle(Workbook workbook, int fontSize) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) fontSize);

        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        return style;
    }
}
