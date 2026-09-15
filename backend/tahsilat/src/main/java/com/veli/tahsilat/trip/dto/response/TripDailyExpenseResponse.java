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

    private String hotelDetail;

    private BigDecimal fuelInvoiceAmount;

    private String fuelDetail;

    private BigDecimal otherAmount;

    private String otherDetail;

    private Integer eveningHotelKm;
}
