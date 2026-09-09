package com.veli.tahsilat.trip.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class TripRequest {

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String vehiclePlate;

    @PositiveOrZero
    private Integer denizliExitKm;

    @PositiveOrZero
    private Integer denizliEntryKm;

    @PositiveOrZero
    private BigDecimal exitFuelAmount;

    @PositiveOrZero
    private BigDecimal tripFuelAmount;

    @PositiveOrZero
    private BigDecimal weeklyAllowance;

    @PositiveOrZero
    private BigDecimal commissionReceived;

    @PositiveOrZero
    private BigDecimal extraReceived;

    @PositiveOrZero
    private BigDecimal agiReceived;

    private String receiverName;

    @Valid
    private List<TripDailyExpenseRequest> dailyExpenses = new ArrayList<>();
}
