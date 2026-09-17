package com.veli.tahsilat.trip.export;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.trip.entity.Trip;
import com.veli.tahsilat.trip.entity.TripDailyExpense;
import com.veli.tahsilat.trip.export.TripDocumentTemplate.Arka;
import com.veli.tahsilat.trip.export.TripDocumentTemplate.On;

import lombok.RequiredArgsConstructor;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Fills the accountants' own "Tahsilat Dökümü" workbook for a single trip.
 *
 * <p>Only data cells are written. Everything the template already owns —
 * styling, merges, print setup, the {@code =B5+1} day chain, the SUM rows and
 * the ÖN sheet's {@code =ARKA!…} references — is left untouched, including the
 * cells the original file keeps as plain numbers rather than formulas.
 */
@Component
@RequiredArgsConstructor
public class TripDocumentGenerator {

    private static final Locale TURKISH = Locale.forLanguageTag("tr-TR");

    private final TripDocumentTemplate template;

    public byte[] generate(Trip trip, List<Collection> collections) {
        List<LocalDate> days = tripDays(trip);

        try (XSSFWorkbook workbook = template.load()) {
            List<Sheet> onSheets = continuationSheets(
                    workbook,
                    TripDocumentTemplate.SHEET_ON,
                    pageCount(days.size(), On.DAY_COL_CAPACITY)
            );
            List<Sheet> arkaSheets = continuationSheets(
                    workbook,
                    TripDocumentTemplate.SHEET_ARKA,
                    pageCount(collections.size(), Arka.DATA_ROW_CAPACITY)
            );

            for (int page = 0; page < arkaSheets.size(); page++) {
                int from = page * Arka.DATA_ROW_CAPACITY;
                int to = Math.min(collections.size(), from + Arka.DATA_ROW_CAPACITY);
                fillArka(
                        arkaSheets.get(page),
                        trip,
                        collections.subList(from, to),
                        from
                );
            }

            if (arkaSheets.size() > 1) {
                retargetOnArkaFormulas(onSheets.get(0), arkaSheets);
            }

            for (int page = 0; page < onSheets.size(); page++) {
                int from = page * On.DAY_COL_CAPACITY;
                int to = Math.min(days.size(), from + On.DAY_COL_CAPACITY);
                fillOn(onSheets.get(page), trip, days.subList(from, to), page == 0);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new BusinessException("Tahsilat dökümü oluşturulamadı.");
        }
    }

    /**
     * Extra pages are cloned from the still-empty template sheet so they keep
     * styling and formulas, then placed next to the original.
     */
    private List<Sheet> continuationSheets(XSSFWorkbook workbook, String baseName, int pages) {
        List<Sheet> sheets = new ArrayList<>();
        sheets.add(workbook.getSheet(baseName));

        int baseIndex = workbook.getSheetIndex(baseName);

        for (int page = 2; page <= pages; page++) {
            Sheet cloned = workbook.cloneSheet(baseIndex);
            String name = baseName + " " + page;
            workbook.setSheetName(workbook.getSheetIndex(cloned), name);
            workbook.setSheetOrder(name, baseIndex + page - 1);
            sheets.add(workbook.getSheet(name));
        }

        return sheets;
    }

    private int pageCount(int size, int capacity) {
        if (size <= 0) {
            return 1;
        }

        return (size + capacity - 1) / capacity;
    }

    /**
     * When collections spill onto ARKA 2+, ÖN's single-sheet references would
     * miss the extra rows. Point them at every ARKA sheet so mutabakat still
     * sees the full trip.
     */
    private void retargetOnArkaFormulas(Sheet on, List<Sheet> arkaSheets) {
        List<String> names = arkaSheets.stream().map(Sheet::getSheetName).toList();

        setFormula(on, 16, 1, joinSheetCells(names, "G35"));
        setFormula(on, 17, 1, joinSheetCells(names, "H35"));
        setFormula(on, 18, 1, joinSheetCells(names, "J35"));
        setFormula(on, 19, 1, joinSheetCells(names, "M35"));
        setFormula(on, 20, 1, joinSheetCells(names, "N35"));
        setFormula(on, 21, 1, joinSheetCells(names, "Q35"));
        setFormula(on, 22, 1, joinSheetCells(names, "R35"));
        setFormula(on, 23, 1, joinSheetCells(names, "O35"));
        setFormula(on, 26, 3, joinCounta(names, "J5:J34"));
        setFormula(on, 27, 3, joinCounta(names, "I5:I34"));
        setFormula(on, 26, 5, joinSheetCells(names, "J35"));
        setFormula(on, 27, 5, joinSheetCells(names, "H35"));
    }

    private String joinSheetCells(List<String> sheetNames, String cell) {
        return sheetNames.stream()
                .map(name -> sheetRef(name) + "!" + cell)
                .collect(Collectors.joining("+"));
    }

    private String joinCounta(List<String> sheetNames, String range) {
        return sheetNames.stream()
                .map(name -> "COUNTA(" + sheetRef(name) + "!" + range + ")")
                .collect(Collectors.joining("+"));
    }

    private String sheetRef(String name) {
        if (name.chars().allMatch(ch -> ch >= 'A' && ch <= 'Z')) {
            return name;
        }

        return "'" + name.replace("'", "''") + "'";
    }

    // ----- ARKA: collection list -----

    private void fillArka(Sheet sheet, Trip trip, List<Collection> collections, int siraOffset) {
        appendSalesmanName(sheet, trip);
        setDate(sheet, Arka.ROW_SALESMAN, Arka.COL_FORM_DATE, trip.getEndDate());

        for (int i = 0; i < collections.size(); i++) {
            int rowIndex = Arka.FIRST_DATA_ROW + i;
            setInteger(sheet, rowIndex, Arka.COL_SIRA_NO, siraOffset + i + 1);
            writeCollectionRow(sheet, rowIndex, collections.get(i));
        }

        writeArkaTotals(sheet, collections);
    }

    /**
     * A2 holds a single label string ending in a colon; the name is appended to
     * it so the wording accounting is used to stays byte-identical.
     */
    private void appendSalesmanName(Sheet sheet, Trip trip) {
        Cell cell = cell(sheet, Arka.ROW_SALESMAN, Arka.COL_SALESMAN_LABEL);
        String label = cell.getStringCellValue();

        cell.setCellValue(label.stripTrailing() + " " + salesmanName(trip));
    }

    /** The paper form is filled in capitals throughout. */
    private String salesmanName(Trip trip) {
        if (trip.getSalesman() == null) {
            return "";
        }

        String name = trip.getSalesman().getFirstName() + " " + trip.getSalesman().getLastName();
        return name.trim().toUpperCase(TURKISH);
    }

    private void writeCollectionRow(Sheet sheet, int rowIndex, Collection collection) {
        setText(sheet, rowIndex, Arka.COL_RECEIPT_NUMBER, collection.getReceiptNumber());
        setText(sheet, rowIndex, Arka.COL_MIKRO_SR, collection.getMikroSr());
        setText(sheet, rowIndex, Arka.COL_MIKRO_NO, collection.getMikroNo());
        setDate(sheet, rowIndex, Arka.COL_DATE, collection.getCollectionDate());

        if (collection.getCustomer() != null) {
            setText(sheet, rowIndex, Arka.COL_CUSTOMER_NAME, collection.getCustomer().getCompanyName());
        }

        BigDecimal amount = collection.getAmount();

        switch (collection.getPaymentType()) {
            case CASH -> setNumber(sheet, rowIndex, Arka.COL_CASH, amount);
            case PROMISSORY_NOTE -> {
                setDate(sheet, rowIndex, Arka.COL_NOTE_MATURITY, collection.getMaturityDate());
                setNumber(sheet, rowIndex, Arka.COL_NOTE_AMOUNT, amount);
            }
            case CHECK -> {
                setText(sheet, rowIndex, Arka.COL_CHECK_BANK, collection.getBankName());
                setDate(sheet, rowIndex, Arka.COL_CHECK_MATURITY, collection.getMaturityDate());
                setNumber(sheet, rowIndex, Arka.COL_CHECK_AMOUNT, amount);
            }
            case MAIL_ORDER -> {
                setText(sheet, rowIndex, Arka.COL_MAILORDER_COMPANY, collection.getMailOrderCompany());
                setNumber(sheet, rowIndex, Arka.COL_MAILORDER_AMOUNT, amount);
            }
            case BANK_TRANSFER -> {
                setText(sheet, rowIndex, Arka.COL_TRANSFER_BANK, collection.getBankName());
                setNumber(sheet, rowIndex, Arka.COL_TRANSFER_AMOUNT, amount);
            }
            case POS_YKB -> setNumber(sheet, rowIndex, Arka.COL_POS_YKB, amount);
            case POS_TEB -> setNumber(sheet, rowIndex, Arka.COL_POS_TEB, amount);
            default -> {
                // CREDIT_CARD is listed as a row but carries no amount column,
                // matching the paper form and the print preview.
            }
        }
    }

    /**
     * G35, H35, J35, M35 and O35 already hold the template's SUM formulas. The
     * original file keeps N35, Q35 and R35 as typed-in numbers, so those three
     * are the only totals written here.
     */
    private void writeArkaTotals(Sheet sheet, List<Collection> collections) {
        PaymentTypeBreakdown breakdown = PaymentTypeBreakdown.fromCollections(collections);

        setTotal(sheet, Arka.ROW_TOTALS, Arka.COL_MAILORDER_AMOUNT, breakdown.mailOrder());
        setTotal(sheet, Arka.ROW_TOTALS, Arka.COL_POS_YKB, breakdown.posYkb());
        setTotal(sheet, Arka.ROW_TOTALS, Arka.COL_POS_TEB, breakdown.posTeb());
    }

    // ----- ÖN: expenses and reconciliation -----

    private void fillOn(Sheet sheet, Trip trip, List<LocalDate> days, boolean primarySheet) {
        if (primarySheet) {
            writeVehicleRow(sheet, trip);
        }

        if (!days.isEmpty()) {
            setDate(sheet, On.ROW_DAYS, On.FIRST_DAY_COL, days.get(0));
        }

        Map<LocalDate, TripDailyExpense> expensesByDate = expensesByDate(trip);
        BigDecimal fuelTotal = BigDecimal.ZERO;
        BigDecimal otherTotal = BigDecimal.ZERO;
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (int i = 0; i < days.size(); i++) {
            int column = On.FIRST_DAY_COL + i;
            TripDailyExpense expense = expensesByDate.get(days.get(i));

            if (expense == null) {
                continue;
            }

            setNumber(sheet, On.ROW_MEAL, column, expense.getMealAmount());
            setNumber(sheet, On.ROW_HOTEL_AMOUNT, column, expense.getHotelAmount());
            setText(sheet, On.ROW_HOTEL_DETAIL, column, expense.getHotelDetail());
            setNumber(sheet, On.ROW_FUEL_AMOUNT, column, expense.getFuelInvoiceAmount());
            setText(sheet, On.ROW_FUEL_DETAIL, column, expense.getFuelDetail());
            setNumber(sheet, On.ROW_OTHER_AMOUNT, column, expense.getOtherAmount());
            setText(sheet, On.ROW_OTHER_DETAIL, column, expense.getOtherDetail());
            setInteger(sheet, On.ROW_EVENING_HOTEL_KM, column, expense.getEveningHotelKm());

            BigDecimal dayTotal = dayTotal(expense);
            grandTotal = grandTotal.add(dayTotal);
            fuelTotal = fuelTotal.add(nvl(expense.getFuelInvoiceAmount()));
            otherTotal = otherTotal.add(nvl(expense.getOtherAmount()));

            // B14 keeps the template's own formula; the remaining day columns
            // are plain numbers in the original file.
            if (column != On.FIRST_DAY_COL) {
                setTotal(sheet, On.ROW_DAILY_TOTAL, column, dayTotal);
            }
        }

        setTotal(sheet, On.ROW_FUEL_AMOUNT, On.COL_ROW_TOTAL, fuelTotal);
        setTotal(sheet, On.ROW_OTHER_AMOUNT, On.COL_ROW_TOTAL, otherTotal);
        setTotal(sheet, On.ROW_DAILY_TOTAL, On.COL_ROW_TOTAL, grandTotal);

        setDate(sheet, On.ROW_HEADER, On.COL_FORM_DATE, trip.getEndDate());
        setText(sheet, On.ROW_HEADER, On.COL_PLATE, trip.getVehiclePlate());
        setText(sheet, On.ROW_HEADER, On.COL_SALESMAN_NAME, salesmanName(trip));

        if (!primarySheet) {
            return;
        }

        setNumber(sheet, On.ROW_WEEKLY_ALLOWANCE, On.COL_RECONCILIATION_VALUE, trip.getWeeklyAllowance());
        setNumber(sheet, On.ROW_EXTRA_RECEIVED, On.COL_RECONCILIATION_VALUE, trip.getExtraReceived());
        setNumber(sheet, On.ROW_AGI_RECEIVED, On.COL_RECONCILIATION_VALUE, trip.getAgiReceived());
        setNumber(
                sheet,
                On.ROW_COMMISSION_EXCLUDED,
                On.COL_COMMISSION_EXCLUDED,
                trip.getCommissionExcludedAmount()
        );

        // Prim matrahı is KDV-exclusive: (genel toplam - primden düşülecek) / 1.2
        setFormula(sheet, 25, 1, "(B25-SUM(C17:C24))/1.2");
        setFormula(sheet, 26, 1, "B26*1%");
    }

    private void writeVehicleRow(Sheet sheet, Trip trip) {
        Integer exitKm = trip.getDenizliExitKm();
        Integer entryKm = trip.getDenizliEntryKm();

        setInteger(sheet, On.ROW_VEHICLE, On.COL_EXIT_KM, exitKm);
        setInteger(sheet, On.ROW_VEHICLE, On.COL_ENTRY_KM, entryKm);
        setNumber(sheet, On.ROW_VEHICLE, On.COL_EXIT_FUEL, trip.getExitFuelAmount());
        setNumber(sheet, On.ROW_VEHICLE, On.COL_TRIP_FUEL, trip.getTripFuelAmount());

        if (exitKm != null && entryKm != null) {
            setInteger(sheet, On.ROW_VEHICLE, On.COL_TOTAL_KM, entryKm - exitKm);
        }

        setNumber(
                sheet,
                On.ROW_VEHICLE,
                On.COL_TOTAL_FUEL,
                nvl(trip.getExitFuelAmount()).add(nvl(trip.getTripFuelAmount()))
        );
    }

    // ----- helpers -----

    private List<LocalDate> tripDays(Trip trip) {
        LocalDate start = trip.getStartDate();
        LocalDate end = trip.getEndDate();

        if (start == null || end == null || end.isBefore(start)) {
            throw new BusinessException("Tur tarihleri eksik veya hatalı.");
        }

        return start.datesUntil(end.plusDays(1)).toList();
    }

    private Map<LocalDate, TripDailyExpense> expensesByDate(Trip trip) {
        Map<LocalDate, TripDailyExpense> byDate = new HashMap<>();

        for (TripDailyExpense expense : trip.getDailyExpenses()) {
            byDate.put(expense.getExpenseDate(), expense);
        }

        return byDate;
    }

    private BigDecimal dayTotal(TripDailyExpense expense) {
        return nvl(expense.getMealAmount())
                .add(nvl(expense.getHotelAmount()))
                .add(nvl(expense.getFuelInvoiceAmount()))
                .add(nvl(expense.getOtherAmount()));
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Cell cell(Sheet sheet, int rowIndex, int columnIndex) {
        Row row = sheet.getRow(rowIndex);

        if (row == null) {
            row = sheet.createRow(rowIndex);
        }

        return row.getCell(columnIndex, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
    }

    /** Blank stays blank: the paper form is filled with gaps, not zeros. */
    private void setNumber(Sheet sheet, int rowIndex, int columnIndex, BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        cell(sheet, rowIndex, columnIndex).setCellValue(value.doubleValue());
    }

    /** Totals are written even when zero, matching the original file. */
    private void setTotal(Sheet sheet, int rowIndex, int columnIndex, BigDecimal value) {
        cell(sheet, rowIndex, columnIndex).setCellValue(nvl(value).doubleValue());
    }

    private void setInteger(Sheet sheet, int rowIndex, int columnIndex, Integer value) {
        if (value == null) {
            return;
        }

        cell(sheet, rowIndex, columnIndex).setCellValue(value);
    }

    private void setText(Sheet sheet, int rowIndex, int columnIndex, String value) {
        if (value == null || value.isBlank()) {
            return;
        }

        cell(sheet, rowIndex, columnIndex).setCellValue(value);
    }

    private void setDate(Sheet sheet, int rowIndex, int columnIndex, LocalDate value) {
        if (value == null) {
            return;
        }

        cell(sheet, rowIndex, columnIndex).setCellValue(value);
    }

    private void setFormula(Sheet sheet, int rowIndex, int columnIndex, String formula) {
        cell(sheet, rowIndex, columnIndex).setCellFormula(formula);
    }
}
