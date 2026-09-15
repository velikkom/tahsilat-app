package com.veli.tahsilat.trip.importexcel.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/**
 * Everything read from the Form 2 ("ÖN") sheet: the trip header fields and
 * the per-day expense grid. Trip start/end date are the min/max of the
 * daily rows' expenseDate - the sheet itself only carries day columns, no
 * explicit start/end date field.
 */
@Getter
@Builder
public class ParsedTripExpenseSheet {

    private String salesmanName;

    private String vehiclePlate;

    private Integer denizliExitKm;

    private Integer denizliEntryKm;

    private BigDecimal exitFuelAmount;

    private BigDecimal tripFuelAmount;

    private List<ParsedTripDailyExpenseRow> dailyExpenses;
}
