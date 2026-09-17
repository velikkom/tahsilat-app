package com.veli.tahsilat.trip.export;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.trip.entity.Trip;
import com.veli.tahsilat.user.entity.User;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class TripDocumentGeneratorTest {

    private final TripDocumentGenerator generator =
            new TripDocumentGenerator(new TripDocumentTemplate());

    @Test
    void commissionExcludedAmountIsWrittenToOnSheetC17() throws IOException {
        Trip trip = baseTrip();
        trip.setCommissionExcludedAmount(new BigDecimal("2700"));

        byte[] bytes = generator.generate(trip, List.of());

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet on = workbook.getSheet(TripDocumentTemplate.SHEET_ON);
            Cell cell = on.getRow(TripDocumentTemplate.On.ROW_COMMISSION_EXCLUDED)
                    .getCell(TripDocumentTemplate.On.COL_COMMISSION_EXCLUDED);

            assertEquals(CellType.NUMERIC, cell.getCellType());
            assertEquals(2700.0, cell.getNumericCellValue(), 0.001);
        }
    }

    @Test
    void blankCommissionExcludedAmountLeavesC17Empty() throws IOException {
        Trip trip = baseTrip();

        byte[] bytes = generator.generate(trip, List.of());

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet on = workbook.getSheet(TripDocumentTemplate.SHEET_ON);
            Cell cell = on.getRow(TripDocumentTemplate.On.ROW_COMMISSION_EXCLUDED)
                    .getCell(TripDocumentTemplate.On.COL_COMMISSION_EXCLUDED);

            if (cell == null) {
                return;
            }

            assertEquals(CellType.BLANK, cell.getCellType());
            assertNull(numericOrNull(cell));
        }
    }

    @Test
    void primMatrahFormulaStripsVat() throws IOException {
        Trip trip = baseTrip();

        byte[] bytes = generator.generate(trip, List.of());

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet on = workbook.getSheet(TripDocumentTemplate.SHEET_ON);

            assertEquals("(B25-SUM(C17:C24))/1.2", on.getRow(25).getCell(1).getCellFormula());
            assertEquals("B26*1%", on.getRow(26).getCell(1).getCellFormula());
        }
    }

    @Test
    void thirtyFirstCollectionOpensASecondArkaSheet() throws IOException {
        Trip trip = baseTrip();
        List<Collection> collections = new ArrayList<>();

        for (int i = 1; i <= 31; i++) {
            collections.add(cashCollection("Musteri " + i, i));
        }

        byte[] bytes = generator.generate(trip, collections);

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            assertNotNull(workbook.getSheet("ARKA 2"));
            assertEquals(31.0, workbook.getSheet("ARKA 2").getRow(4).getCell(0).getNumericCellValue(), 0.001);
            assertEquals("Musteri 31", workbook.getSheet("ARKA 2").getRow(4).getCell(4).getStringCellValue());
            assertEquals(
                    "ARKA!G35+'ARKA 2'!G35",
                    workbook.getSheet(TripDocumentTemplate.SHEET_ON).getRow(16).getCell(1).getCellFormula()
            );
        }
    }

    @Test
    void seventhTripDayOpensASecondOnSheet() throws IOException {
        Trip trip = baseTrip();
        trip.setEndDate(trip.getStartDate().plusDays(6));

        byte[] bytes = generator.generate(trip, List.of());

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            Sheet secondOn = workbook.getSheet("ON 2");
            assertNotNull(secondOn);

            LocalDate seventhDay = trip.getStartDate().plusDays(6);
            assertEquals(
                    seventhDay,
                    secondOn.getRow(TripDocumentTemplate.On.ROW_DAYS)
                            .getCell(TripDocumentTemplate.On.FIRST_DAY_COL)
                            .getLocalDateTimeCellValue()
                            .toLocalDate()
            );
        }
    }

    private Collection cashCollection(String customerName, int amount) {
        Customer customer = new Customer();
        customer.setCompanyName(customerName);

        Collection collection = new Collection();
        collection.setCustomer(customer);
        collection.setAmount(BigDecimal.valueOf(amount));
        collection.setCollectionDate(LocalDate.of(2026, 8, 13));
        collection.setPaymentType(PaymentType.CASH);
        return collection;
    }

    private Trip baseTrip() {
        User salesman = new User();
        salesman.setFirstName("Veli");
        salesman.setLastName("Kara");

        Trip trip = new Trip();
        trip.setSalesman(salesman);
        trip.setStartDate(LocalDate.of(2026, 8, 13));
        trip.setEndDate(LocalDate.of(2026, 8, 16));
        return trip;
    }

    private Double numericOrNull(Cell cell) {
        return cell.getCellType() == CellType.NUMERIC ? cell.getNumericCellValue() : null;
    }
}
