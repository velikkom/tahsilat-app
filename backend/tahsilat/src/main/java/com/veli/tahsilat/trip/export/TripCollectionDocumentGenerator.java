package com.veli.tahsilat.trip.export;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.trip.entity.Trip;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Builds the Excel equivalent of the paper "TAHSİLAT DÖKÜMÜDÜR" form
 * (Form 1) for a single trip: one row per collection made by the trip's
 * salesman during the trip's date range.
 */
@Component
public class TripCollectionDocumentGenerator {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd.MM.yyyy");

    private static final int MAX_ROWS = 200;

    private static final int COL_SIRA_NO = 0;
    private static final int COL_MAKBUZ_NO = 1;
    private static final int COL_MIKRO_SR = 2;
    private static final int COL_MIKRO_NO = 3;
    private static final int COL_UNVANI = 4;
    private static final int COL_TARIH = 5;
    private static final int COL_NAKIT_TUTARI = 6;
    private static final int COL_SENET_VADE = 7;
    private static final int COL_SENET_TUTAR = 8;
    private static final int COL_BANKA_ADI = 9;
    private static final int COL_CEK_VADE = 10;
    private static final int COL_CEK_TUTAR = 11;
    private static final int COL_MAILORDER_KARLAND = 12;
    private static final int COL_MAILORDER_OTOKOC = 13;
    private static final int COL_HAVALE_BANKA = 14;
    private static final int COL_HAVALE_TUTAR = 15;
    private static final int COL_POS_YKB = 16;
    private static final int COL_POS_TEB = 17;

    private static final int LAST_COLUMN = COL_POS_TEB;

    public byte[] generate(Trip trip, List<Collection> collections) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Form 1");
            sheet.getPrintSetup().setLandscape(true);
            sheet.setFitToPage(true);

            CellStyle titleStyle = boldStyle(workbook, 14);
            CellStyle labelStyle = boldStyle(workbook, 10);
            CellStyle headerStyle = headerStyle(workbook);

            int rowIndex = 0;

            rowIndex = writeTitle(sheet, titleStyle, rowIndex);
            rowIndex = writeSalesmanRow(sheet, labelStyle, rowIndex, trip);
            rowIndex++;

            rowIndex = writeTableHeader(sheet, headerStyle, rowIndex);

            List<Collection> rows = collections.size() > MAX_ROWS
                    ? collections.subList(0, MAX_ROWS)
                    : collections;

            int siraNo = 1;

            for (Collection collection : rows) {
                writeCollectionRow(sheet, rowIndex, siraNo, collection);
                rowIndex++;
                siraNo++;
            }

            writeTotalsRow(sheet, labelStyle, rowIndex, rows);

            for (int col = 0; col <= LAST_COLUMN; col++) {
                sheet.autoSizeColumn(col);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new BusinessException("Tahsilat dökümü oluşturulamadı.");
        }
    }

    private int writeTitle(Sheet sheet, CellStyle titleStyle, int rowIndex) {
        Row titleRow = sheet.createRow(rowIndex);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("DENOTO KOLL. ŞTİ. AİT SATIŞ PERSONELİ TAHSİLAT DÖKÜMÜDÜR");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, 0, LAST_COLUMN));
        return rowIndex + 1;
    }

    private int writeSalesmanRow(Sheet sheet, CellStyle labelStyle, int rowIndex, Trip trip) {
        String salesmanName = trip.getSalesman() == null
                ? null
                : (trip.getSalesman().getFirstName() + " " + trip.getSalesman().getLastName()).trim();

        Row row = sheet.createRow(rowIndex);

        Cell nameLabelCell = row.createCell(0);
        nameLabelCell.setCellValue("SATIŞ PERSONELİ ADI/SOYADI");
        nameLabelCell.setCellStyle(labelStyle);
        setCell(sheet, rowIndex, 1, salesmanName);

        Cell dateLabelCell = row.createCell(3);
        dateLabelCell.setCellValue("TARİH");
        dateLabelCell.setCellStyle(labelStyle);
        setCell(sheet, rowIndex, 4, trip.getStartDate() == null ? null : trip.getStartDate().format(DATE_FORMATTER));

        return rowIndex + 1;
    }

    private int writeTableHeader(Sheet sheet, CellStyle headerStyle, int rowIndex) {
        int groupRow = rowIndex;
        int subRow = rowIndex + 1;

        sheet.createRow(groupRow);
        sheet.createRow(subRow);

        setSingleColumnHeader(sheet, groupRow, subRow, COL_SIRA_NO, "SIRA NO", headerStyle);
        setSingleColumnHeader(sheet, groupRow, subRow, COL_MAKBUZ_NO, "TAHSİLAT MAKBUZ NO", headerStyle);

        setGroupHeader(sheet, groupRow, subRow, COL_MIKRO_SR, COL_MIKRO_NO, "MİKRO KAY.NO", "SR", "NO", headerStyle);

        setSingleColumnHeader(sheet, groupRow, subRow, COL_UNVANI, "ÜNVANI", headerStyle);
        setSingleColumnHeader(sheet, groupRow, subRow, COL_TARIH, "TARİH", headerStyle);
        setSingleColumnHeader(sheet, groupRow, subRow, COL_NAKIT_TUTARI, "NAKİT TUTARI", headerStyle);

        setGroupHeader(sheet, groupRow, subRow, COL_SENET_VADE, COL_SENET_TUTAR, "SENET", "VADE", "TUTAR", headerStyle);

        setSingleColumnHeader(sheet, groupRow, subRow, COL_BANKA_ADI, "BANKA ADI", headerStyle);

        setGroupHeader(sheet, groupRow, subRow, COL_CEK_VADE, COL_CEK_TUTAR, "ÇEK", "VADE", "TUTAR", headerStyle);

        setSingleColumnHeader(sheet, groupRow, subRow, COL_MAILORDER_KARLAND, "MAILORDER KARLAND", headerStyle);
        setSingleColumnHeader(sheet, groupRow, subRow, COL_MAILORDER_OTOKOC, "MAILORDER OTOKOÇ", headerStyle);

        setGroupHeader(sheet, groupRow, subRow, COL_HAVALE_BANKA, COL_HAVALE_TUTAR, "HAVALE", "BANKA", "TUTAR", headerStyle);

        setSingleColumnHeader(sheet, groupRow, subRow, COL_POS_YKB, "POS YKB", headerStyle);
        setSingleColumnHeader(sheet, groupRow, subRow, COL_POS_TEB, "POS TEB", headerStyle);

        return subRow + 1;
    }

    private void writeCollectionRow(Sheet sheet, int rowIndex, int siraNo, Collection collection) {
        Row row = sheet.createRow(rowIndex);
        row.createCell(COL_SIRA_NO).setCellValue(siraNo);

        setCell(sheet, rowIndex, COL_MAKBUZ_NO, collection.getReceiptNumber());
        setCell(sheet, rowIndex, COL_MIKRO_SR, collection.getMikroSr());
        setCell(sheet, rowIndex, COL_MIKRO_NO, collection.getMikroNo());
        setCell(sheet, rowIndex, COL_UNVANI, customerName(collection));
        setCell(sheet, rowIndex, COL_TARIH,
                collection.getCollectionDate() == null ? null : collection.getCollectionDate().format(DATE_FORMATTER));
        setCell(sheet, rowIndex, COL_BANKA_ADI, collection.getBankName());

        PaymentType paymentType = collection.getPaymentType();

        if (paymentType == PaymentType.CASH) {
            setCell(sheet, rowIndex, COL_NAKIT_TUTARI, collection.getAmount());
        } else if (paymentType == PaymentType.PROMISSORY_NOTE) {
            setCell(sheet, rowIndex, COL_SENET_VADE,
                    collection.getMaturityDate() == null ? null : collection.getMaturityDate().format(DATE_FORMATTER));
            setCell(sheet, rowIndex, COL_SENET_TUTAR, collection.getAmount());
        } else if (paymentType == PaymentType.CHECK) {
            setCell(sheet, rowIndex, COL_CEK_VADE,
                    collection.getMaturityDate() == null ? null : collection.getMaturityDate().format(DATE_FORMATTER));
            setCell(sheet, rowIndex, COL_CEK_TUTAR, collection.getAmount());
        } else if (paymentType == PaymentType.BANK_TRANSFER) {
            setCell(sheet, rowIndex, COL_HAVALE_BANKA, collection.getBankName());
            setCell(sheet, rowIndex, COL_HAVALE_TUTAR, collection.getAmount());
        }

        // CREDIT_CARD (and any other/unknown type) is intentionally written
        // to no amount column - there is no matching slot on the paper form yet.
    }

    private void writeTotalsRow(Sheet sheet, CellStyle labelStyle, int rowIndex, List<Collection> collections) {
        BigDecimal cashTotal = BigDecimal.ZERO;
        BigDecimal promissoryNoteTotal = BigDecimal.ZERO;
        BigDecimal checkTotal = BigDecimal.ZERO;
        BigDecimal bankTransferTotal = BigDecimal.ZERO;

        for (Collection collection : collections) {
            BigDecimal amount = collection.getAmount() == null ? BigDecimal.ZERO : collection.getAmount();
            PaymentType paymentType = collection.getPaymentType();

            if (paymentType == PaymentType.CASH) {
                cashTotal = cashTotal.add(amount);
            } else if (paymentType == PaymentType.PROMISSORY_NOTE) {
                promissoryNoteTotal = promissoryNoteTotal.add(amount);
            } else if (paymentType == PaymentType.CHECK) {
                checkTotal = checkTotal.add(amount);
            } else if (paymentType == PaymentType.BANK_TRANSFER) {
                bankTransferTotal = bankTransferTotal.add(amount);
            }
        }

        Row row = sheet.createRow(rowIndex);
        Cell labelCell = row.createCell(COL_UNVANI);
        labelCell.setCellValue("GENEL TOPLAM");
        labelCell.setCellStyle(labelStyle);

        setCell(sheet, rowIndex, COL_NAKIT_TUTARI, cashTotal);
        setCell(sheet, rowIndex, COL_SENET_TUTAR, promissoryNoteTotal);
        setCell(sheet, rowIndex, COL_CEK_TUTAR, checkTotal);
        setCell(sheet, rowIndex, COL_HAVALE_TUTAR, bankTransferTotal);
    }

    private String customerName(Collection collection) {
        return collection.getCustomer() == null ? null : collection.getCustomer().getCompanyName();
    }

    private void setSingleColumnHeader(
            Sheet sheet,
            int groupRow,
            int subRow,
            int column,
            String label,
            CellStyle headerStyle
    ) {
        Cell cell = sheet.getRow(groupRow).createCell(column);
        cell.setCellValue(label);
        cell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(groupRow, subRow, column, column));
    }

    private void setGroupHeader(
            Sheet sheet,
            int groupRow,
            int subRow,
            int firstColumn,
            int secondColumn,
            String groupLabel,
            String firstSubLabel,
            String secondSubLabel,
            CellStyle headerStyle
    ) {
        Cell groupCell = sheet.getRow(groupRow).createCell(firstColumn);
        groupCell.setCellValue(groupLabel);
        groupCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(groupRow, groupRow, firstColumn, secondColumn));

        Cell firstSubCell = sheet.getRow(subRow).createCell(firstColumn);
        firstSubCell.setCellValue(firstSubLabel);
        firstSubCell.setCellStyle(headerStyle);

        Cell secondSubCell = sheet.getRow(subRow).createCell(secondColumn);
        secondSubCell.setCellValue(secondSubLabel);
        secondSubCell.setCellStyle(headerStyle);
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

    private CellStyle boldStyle(Workbook workbook, int fontSize) {
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) fontSize);

        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        return style;
    }

    private CellStyle headerStyle(Workbook workbook) {
        CellStyle style = boldStyle(workbook, 9);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setWrapText(true);
        return style;
    }
}
