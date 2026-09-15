package com.veli.tahsilat.trip.importexcel.support;

import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.trip.importexcel.dto.ParsedTripCollectionRow;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Parses Form 1 / "ARKA" sheet (tahsilat dökümü). Column layout is a fixed
 * 18-column grid (verified against the real paper form template):
 *
 * 0 SIRA NO, 1 MAKBUZ NO, 2 MİKRO SR, 3 MİKRO NO, 4 ÜNVANI, 5 TARİH,
 * 6 NAKİT TUTARI, 7 SENET VADE, 8 SENET TUTAR, 9 ÇEK BANKA ADI,
 * 10 ÇEK VADE, 11 ÇEK TUTAR, 12 MAİLORDER FİRMA, 13 MAİLORDER TUTAR,
 * 14 HAVALE BANKA, 15 HAVALE TUTAR, 16 POS YKB, 17 POS TEB.
 *
 * Note this differs from TripCollectionDocumentGenerator's own export
 * layout, which gives ÇEK's bank name a standalone column instead of
 * grouping it under ÇEK - both represent the same Collection.bankName
 * field, just laid out differently; this parser follows the real form.
 *
 * Data rows start wherever SIRA NO first reaches 1 (found by scanning,
 * not a hardcoded row) and continue while ÜNVANI (customer name) is
 * non-blank - the paper form pads unused rows up to a fixed row count
 * with a bare SIRA NO and nothing else, which this stops on.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TripCollectionSheetParser {

    private static final int COL_SIRA_NO = 0;
    private static final int COL_MAKBUZ_NO = 1;
    private static final int COL_MIKRO_SR = 2;
    private static final int COL_MIKRO_NO = 3;
    private static final int COL_UNVANI = 4;
    private static final int COL_TARIH = 5;
    private static final int COL_NAKIT_TUTARI = 6;
    private static final int COL_SENET_VADE = 7;
    private static final int COL_SENET_TUTAR = 8;
    private static final int COL_CEK_BANKA = 9;
    private static final int COL_CEK_VADE = 10;
    private static final int COL_CEK_TUTAR = 11;
    private static final int COL_MAILORDER_FIRMA = 12;
    private static final int COL_MAILORDER_TUTAR = 13;
    private static final int COL_HAVALE_BANKA = 14;
    private static final int COL_HAVALE_TUTAR = 15;
    private static final int COL_POS_YKB = 16;
    private static final int COL_POS_TEB = 17;

    private static final int MAX_SCAN_ROWS = 500;

    private final XlsxFileValidator xlsxFileValidator;
    private final TripSheetParseSupport parseSupport;

    public List<ParsedTripCollectionRow> parse(MultipartFile file) {
        xlsxFileValidator.validate(file, "Tahsilat dökümü (Form 1)");

        try (
                InputStream inputStream = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(inputStream)
        ) {
            Sheet sheet = workbook.getSheetAt(0);

            int dataStartRow = findDataStartRow(sheet);

            if (dataStartRow < 0) {
                throw new BusinessException(
                        "Tahsilat dökümünde veri satırları bulunamadı (SIRA NO 1 ile başlayan satır yok)."
                );
            }

            List<ParsedTripCollectionRow> rows = new ArrayList<>();

            for (int rowIndex = dataStartRow; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);

                if (row == null || parseSupport.isBlank(row.getCell(COL_UNVANI))) {
                    break;
                }

                rows.add(parseRow(row));
            }

            return rows;
        } catch (BusinessException exception) {
            throw exception;
        } catch (Exception exception) {
            log.error("Trip collection sheet parse failed", exception);
            throw new BusinessException("Tahsilat dökümü (Form 1) okunamadı.");
        }
    }

    private int findDataStartRow(Sheet sheet) {
        int lastRow = Math.min(sheet.getLastRowNum(), MAX_SCAN_ROWS);

        for (int rowIndex = 0; rowIndex <= lastRow; rowIndex++) {
            Row row = sheet.getRow(rowIndex);

            if (row == null) {
                continue;
            }

            Integer siraNo = parseSupport.parseInteger(row.getCell(COL_SIRA_NO));

            if (siraNo != null && siraNo == 1) {
                return rowIndex;
            }
        }

        return -1;
    }

    private ParsedTripCollectionRow parseRow(Row row) {
        int rowNumber = row.getRowNum() + 1;

        ParsedTripCollectionRow.ParsedTripCollectionRowBuilder builder = ParsedTripCollectionRow.builder()
                .rowNumber(rowNumber)
                .receiptNumber(blankToNull(parseSupport.getCellString(row.getCell(COL_MAKBUZ_NO))))
                .mikroSr(blankToNull(parseSupport.getCellString(row.getCell(COL_MIKRO_SR))))
                .mikroNo(blankToNull(parseSupport.getCellString(row.getCell(COL_MIKRO_NO))))
                .customerName(parseSupport.getCellString(row.getCell(COL_UNVANI)))
                .collectionDate(parseSupport.parseDate(row.getCell(COL_TARIH)));

        applyPaymentType(row, builder);

        return builder.build();
    }

    private void applyPaymentType(Row row, ParsedTripCollectionRow.ParsedTripCollectionRowBuilder builder) {
        BigDecimal cash = parseSupport.parseAmount(row.getCell(COL_NAKIT_TUTARI));
        BigDecimal promissoryNote = parseSupport.parseAmount(row.getCell(COL_SENET_TUTAR));
        BigDecimal check = parseSupport.parseAmount(row.getCell(COL_CEK_TUTAR));
        BigDecimal mailOrder = parseSupport.parseAmount(row.getCell(COL_MAILORDER_TUTAR));
        BigDecimal bankTransfer = parseSupport.parseAmount(row.getCell(COL_HAVALE_TUTAR));
        BigDecimal posYkb = parseSupport.parseAmount(row.getCell(COL_POS_YKB));
        BigDecimal posTeb = parseSupport.parseAmount(row.getCell(COL_POS_TEB));

        if (isPositive(cash)) {
            builder.paymentType(PaymentType.CASH).amount(cash);
        } else if (isPositive(promissoryNote)) {
            builder.paymentType(PaymentType.PROMISSORY_NOTE)
                    .amount(promissoryNote)
                    .maturityDate(parseSupport.parseDate(row.getCell(COL_SENET_VADE)));
        } else if (isPositive(check)) {
            builder.paymentType(PaymentType.CHECK)
                    .amount(check)
                    .maturityDate(parseSupport.parseDate(row.getCell(COL_CEK_VADE)))
                    .bankName(blankToNull(parseSupport.getCellString(row.getCell(COL_CEK_BANKA))));
        } else if (isPositive(mailOrder)) {
            builder.paymentType(PaymentType.MAIL_ORDER)
                    .amount(mailOrder)
                    .mailOrderCompany(blankToNull(parseSupport.getCellString(row.getCell(COL_MAILORDER_FIRMA))));
        } else if (isPositive(bankTransfer)) {
            builder.paymentType(PaymentType.BANK_TRANSFER)
                    .amount(bankTransfer)
                    .bankName(blankToNull(parseSupport.getCellString(row.getCell(COL_HAVALE_BANKA))));
        } else if (isPositive(posYkb)) {
            builder.paymentType(PaymentType.POS_YKB).amount(posYkb);
        } else if (isPositive(posTeb)) {
            builder.paymentType(PaymentType.POS_TEB).amount(posTeb);
        }
    }

    private boolean isPositive(BigDecimal value) {
        return value != null && value.compareTo(BigDecimal.ZERO) > 0;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
