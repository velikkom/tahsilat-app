package com.veli.tahsilat.trip.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class TripResponse {

    private UUID id;

    private UUID salesmanId;

    private String salesmanName;

    private LocalDate startDate;

    private LocalDate endDate;

    private String vehiclePlate;

    private Integer denizliExitKm;

    private Integer denizliEntryKm;

    private BigDecimal exitFuelAmount;

    private BigDecimal tripFuelAmount;

    private BigDecimal weeklyAllowance;

    private BigDecimal commissionReceived;

    private BigDecimal extraReceived;

    private BigDecimal agiReceived;

    private String receiverName;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<TripDailyExpenseResponse> dailyExpenses;
}
