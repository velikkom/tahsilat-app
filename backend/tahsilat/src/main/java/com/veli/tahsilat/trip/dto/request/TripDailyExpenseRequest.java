package com.veli.tahsilat.trip.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

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

    @Size(max = 200)
    private String hotelDetail;

    @PositiveOrZero
    private BigDecimal fuelInvoiceAmount;

    @Size(max = 200)
    private String fuelDetail;

    @PositiveOrZero
    private BigDecimal otherAmount;

    @Size(max = 200)
    private String otherDetail;

    @PositiveOrZero
    private Integer eveningHotelKm;
}
