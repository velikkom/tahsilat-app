package com.veli.tahsilat.trip.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class TripDailyExpenseResponse {

    private UUID id;

    private LocalDate expenseDate;

    private BigDecimal mealAmount;

    private BigDecimal hotelAmount;

    private BigDecimal fuelInvoiceAmount;

    private BigDecimal otherAmount;

    private Integer eveningHotelKm;
}
