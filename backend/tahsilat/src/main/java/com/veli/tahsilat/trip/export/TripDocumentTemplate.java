package com.veli.tahsilat.trip.export;

import com.veli.tahsilat.common.exception.BusinessException;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

/**
 * Loads the hand-made "Tahsilat Dökümü" workbook that accounting already uses,
 * so generated documents keep the original styling, merges, print setup and
 * formulas. The template is the accountants' own file with the sample data
 * removed; only data cells are written when filling it in.
 *
 * <p>The ÖN sheet pulls its collection totals from the ARKA sheet through
 * in-sheet formulas (for example {@code =ARKA!G35}), mirroring the external
 * links of the original weekly master workbook.
 */
@Component
public class TripDocumentTemplate {

    public static final String RESOURCE_PATH = "templates/tahsilat-dokumu-template.xlsx";

    public static final String SHEET_ON = "ON";
    public static final String SHEET_ARKA = "ARKA";

    /** Row and column indices below are 0-based POI coordinates. */
    public static final class Arka {

        /** A2, merged A2:E2 — label text with the salesman name appended. */
        public static final int ROW_SALESMAN = 1;
        public static final int COL_SALESMAN_LABEL = 0;

        /** N2, merged N2:O2 — document date. */
        public static final int COL_FORM_DATE = 13;

        /** Collection rows: Excel rows 5..34, SIRA NO in column A is pre-filled. */
        public static final int FIRST_DATA_ROW = 4;
        public static final int LAST_DATA_ROW = 33;
        public static final int DATA_ROW_CAPACITY = LAST_DATA_ROW - FIRST_DATA_ROW + 1;

        public static final int COL_SIRA_NO = 0;
        public static final int COL_RECEIPT_NUMBER = 1;
        public static final int COL_MIKRO_SR = 2;
        public static final int COL_MIKRO_NO = 3;
        public static final int COL_CUSTOMER_NAME = 4;
        public static final int COL_DATE = 5;
        public static final int COL_CASH = 6;
        public static final int COL_NOTE_MATURITY = 7;
        public static final int COL_NOTE_AMOUNT = 8;
        public static final int COL_CHECK_BANK = 9;
        public static final int COL_CHECK_MATURITY = 10;
        public static final int COL_CHECK_AMOUNT = 11;
        public static final int COL_MAILORDER_COMPANY = 12;
        public static final int COL_MAILORDER_AMOUNT = 13;
        public static final int COL_TRANSFER_BANK = 14;
        public static final int COL_TRANSFER_AMOUNT = 15;
        public static final int COL_POS_YKB = 16;
        public static final int COL_POS_TEB = 17;

        /**
         * Excel row 35. Columns G, H, J, M and O already hold the template's own
         * SUM formulas and must not be overwritten; N, Q and R are plain numbers
         * in the original file, so totals for those are written as values.
         */
        public static final int ROW_TOTALS = 34;

        private Arka() {
        }
    }

    /** Row and column indices below are 0-based POI coordinates. */
    public static final class On {

        /** Excel row 4 — vehicle figures under the row 3 headers. */
        public static final int ROW_VEHICLE = 3;
        public static final int COL_EXIT_KM = 1;
        public static final int COL_EXIT_FUEL = 2;
        public static final int COL_TRIP_FUEL = 3;
        public static final int COL_ENTRY_KM = 4;
        public static final int COL_TOTAL_KM = 5;
        public static final int COL_TOTAL_FUEL = 6;

        /**
         * Excel row 5. Only B5 is written; C5..G5 carry the template's own
         * {@code =B5+1} chain that rolls the remaining day columns forward.
         */
        public static final int ROW_DAYS = 4;

        public static final int FIRST_DAY_COL = 1;
        public static final int LAST_DAY_COL = 6;
        public static final int DAY_COL_CAPACITY = LAST_DAY_COL - FIRST_DAY_COL + 1;

        /** Expense grid: amount rows and the free-text rows underneath them. */
        public static final int ROW_MEAL = 5;
        public static final int ROW_HOTEL_AMOUNT = 6;
        public static final int ROW_HOTEL_DETAIL = 7;
        public static final int ROW_FUEL_AMOUNT = 8;
        public static final int ROW_FUEL_DETAIL = 9;
        public static final int ROW_OTHER_AMOUNT = 10;
        public static final int ROW_OTHER_DETAIL = 11;
        public static final int ROW_EVENING_HOTEL_KM = 12;

        /**
         * Excel row 14. B14 keeps the template formula; C14..G14 and H14 are
         * plain numbers in the original file and are written as values.
         */
        public static final int ROW_DAILY_TOTAL = 13;

        /** Column H — per-row totals. H6/H7 are template formulas; H9/H11/H14 are values. */
        public static final int COL_ROW_TOTAL = 7;

        /** Excel row 15 — document date, salesman name (merged D15:E15), plate (merged G15:H15). */
        public static final int ROW_HEADER = 14;
        public static final int COL_FORM_DATE = 1;
        public static final int COL_SALESMAN_NAME = 3;
        public static final int COL_PLATE = 6;

        /**
         * Column C of the tahsilat özeti: "PİRİMDEN DÜŞÜLECEK TAHSİLAT".
         * A single trip-level amount is written on the nakit row (C17);
         * {@code B26 = B25 - SUM(C17:C24)} then subtracts it from genel toplam.
         */
        public static final int COL_COMMISSION_EXCLUDED = 2;
        public static final int ROW_COMMISSION_EXCLUDED = 16;

        /** Reconciliation block, column E. */
        public static final int COL_RECONCILIATION_VALUE = 4;
        public static final int ROW_WEEKLY_ALLOWANCE = 17;
        public static final int ROW_EXTRA_RECEIVED = 19;
        public static final int ROW_AGI_RECEIVED = 20;

        private On() {
        }
    }

    /**
     * Returns a fresh workbook for every call, since filling mutates it.
     * Formula recalculation is forced because the template still carries the
     * cached results of the sample data that was stripped out of it.
     */
    public XSSFWorkbook load() {
        try (InputStream inputStream = new ClassPathResource(RESOURCE_PATH).getInputStream()) {
            XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
            workbook.setForceFormulaRecalculation(true);
            return workbook;
        } catch (IOException exception) {
            throw new BusinessException("Tahsilat dökümü şablonu okunamadı.");
        }
    }
}
