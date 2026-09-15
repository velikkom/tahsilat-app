package com.veli.tahsilat.trip.importexcel.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class ParsedTripDailyExpenseRow {

    private LocalDate expenseDate;

    private BigDecimal mealAmount;

    private BigDecimal hotelAmount;

    private BigDecimal fuelInvoiceAmount;

    private BigDecimal otherAmount;

    private Integer eveningHotelKm;
}
