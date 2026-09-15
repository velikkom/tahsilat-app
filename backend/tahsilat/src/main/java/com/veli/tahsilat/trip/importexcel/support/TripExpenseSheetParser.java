package com.veli.tahsilat.trip.importexcel.support;

import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.trip.importexcel.dto.ParsedTripDailyExpenseRow;
import com.veli.tahsilat.trip.importexcel.dto.ParsedTripExpenseSheet;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Parses Form 2 / "ÖN" sheet (harcama dökümü): the vehicle/km/fuel header
 * and the per-day expense grid (one column per trip day). The real paper
 * form has no fixed row numbers for these blocks - some weeks' km/fuel
 * header row is filled, some aren't, and blank rows pad the label column
 * for two-line labels - so every block is located by scanning for a
 * distinctive label substring rather than a hardcoded offset.
 *
 * Not parsed (deliberately): the "TOPLAM"/"TOPLAM KM"/"TOPL.YAKIT TUTARI"
 * columns and the whole tahsilat özeti / mutabakat block after the daily
 * table - all of it is a derived summary the app already recomputes from
 * the imported Trip + Collection rows (see TripExpenseDocumentGenerator).
 * Per-day hotel/fuel/other TEXT detail (hotelDetail/fuelDetail/
 * otherDetail) also isn't populated from this sheet layout - the real
 * form only has one row per item (the amount), with no separate cell for
 * the firma/invoice-no text the row label describes.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TripExpenseSheetParser {

    private static final int MAX_DAY_COLUMNS = 20;

    private final XlsxFileValidator xlsxFileValidator;
    private final TripSheetParseSupport parseSupport;

    public ParsedTripExpenseSheet parse(MultipartFile file) {
        xlsxFileValidator.validate(file, "Harcama dökümü (Form 2)");

        try (
                InputStream inputStream = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(inputStream)
        ) {
            Sheet sheet = workbook.getSheetAt(0);

            int mealRowIndex = parseSupport.findRowIndexByLabel(sheet, "YEMEK");

            if (mealRowIndex < 1) {
                throw new BusinessException(
                        "Harcama dökümünde 'YEMEK BEDELİ' satırı bulunamadı."
                );
            }

            int datesRowIndex = mealRowIndex - 1;
            int hotelRowIndex = parseSupport.findRowIndexByLabel(sheet, "OTEL");
            int fuelRowIndex = parseSupport.findRowIndexByLabel(sheet, "AL.");
            int otherRowIndex = parseSupport.findRowIndexByLabel(sheet, "AÇIKLAMA");
            int eveningKmRowIndex = parseSupport.findRowIndexByLabel(sheet, "AKŞAM");

            List<LocalDate> days = readDayColumns(sheet.getRow(datesRowIndex));

            if (days.isEmpty()) {
                throw new BusinessException(
                        "Harcama dökümünde günlük tarih kolonları okunamadı."
                );
            }

            List<ParsedTripDailyExpenseRow> dailyExpenses = new ArrayList<>();

            Row mealRow = sheet.getRow(mealRowIndex);
            Row hotelRow = hotelRowIndex >= 0 ? sheet.getRow(hotelRowIndex) : null;
            Row fuelRow = fuelRowIndex >= 0 ? sheet.getRow(fuelRowIndex) : null;
            Row otherRow = otherRowIndex >= 0 ? sheet.getRow(otherRowIndex) : null;
            Row eveningKmRow = eveningKmRowIndex >= 0 ? sheet.getRow(eveningKmRowIndex) : null;

            for (int i = 0; i < days.size(); i++) {
                int column = i + 1;

                dailyExpenses.add(
                        ParsedTripDailyExpenseRow.builder()
                                .expenseDate(days.get(i))
                                .mealAmount(parseSupport.parseAmount(cellAt(mealRow, column)))
                                .hotelAmount(parseSupport.parseAmount(cellAt(hotelRow, column)))
                                .fuelInvoiceAmount(parseSupport.parseAmount(cellAt(fuelRow, column)))
                                .otherAmount(parseSupport.parseAmount(cellAt(otherRow, column)))
                                .eveningHotelKm(parseSupport.parseInteger(cellAt(eveningKmRow, column)))
                                .build()
                );
            }

            String salesmanName = parseSupport.findValueRightOfLabel(sheet, "SATIŞ PERSONELİ");
            String vehiclePlate = parseSupport.findValueRightOfLabel(sheet, "PLAKA");

            int vehicleHeaderRowIndex = parseSupport.findRowIndexByLabel(sheet, "ÇIKIŞ YAKIT");
            Row vehicleValueRow = vehicleHeaderRowIndex >= 0
                    ? sheet.getRow(vehicleHeaderRowIndex + 1)
                    : null;

            return ParsedTripExpenseSheet.builder()
                    .salesmanName(salesmanName)
                    .vehiclePlate(vehiclePlate)
                    .denizliExitKm(parseSupport.parseInteger(cellAt(vehicleValueRow, 1)))
                    .exitFuelAmount(parseSupport.parseAmount(cellAt(vehicleValueRow, 2)))
                    .tripFuelAmount(parseSupport.parseAmount(cellAt(vehicleValueRow, 3)))
                    .denizliEntryKm(parseSupport.parseInteger(cellAt(vehicleValueRow, 4)))
                    .dailyExpenses(dailyExpenses)
                    .build();
        } catch (BusinessException exception) {
            throw exception;
        } catch (Exception exception) {
            log.error("Trip expense sheet parse failed", exception);
            throw new BusinessException("Harcama dökümü (Form 2) okunamadı.");
        }
    }

    private List<LocalDate> readDayColumns(Row datesRow) {
        List<LocalDate> days = new ArrayList<>();

        if (datesRow == null) {
            return days;
        }

        for (int column = 1; column <= MAX_DAY_COLUMNS; column++) {
            LocalDate date = parseSupport.parseDate(datesRow.getCell(column));

            if (date == null) {
                break;
            }

            days.add(date);
        }

        return days;
    }

    private org.apache.poi.ss.usermodel.Cell cellAt(Row row, int column) {
        return row == null ? null : row.getCell(column);
    }
}
