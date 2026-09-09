package com.veli.tahsilat.trip.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class TripDailyExpenseRequest {

    @NotNull
    private LocalDate expenseDate;

    @PositiveOrZero
    private BigDecimal mealAmount;

    @PositiveOrZero
    private BigDecimal hotelAmount;

    @PositiveOrZero
    private BigDecimal fuelInvoiceAmount;

    @PositiveOrZero
    private BigDecimal otherAmount;

    @PositiveOrZero
    private Integer eveningHotelKm;
}
