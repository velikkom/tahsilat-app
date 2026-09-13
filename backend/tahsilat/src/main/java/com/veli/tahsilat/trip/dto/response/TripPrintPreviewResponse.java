package com.veli.tahsilat.trip.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Payload for the on-screen Form 1 + Form 2 print preview
 * (GET /trips/{id}/print-preview). Same underlying data and business
 * rules as the two xlsx exports - see PaymentTypeBreakdown and
 * TripPrintPreviewBuilder for the shared calculations.
 */
@Getter
@Builder
public class TripPrintPreviewResponse {

    private UUID id;

    private String salesmanName;

    private String vehiclePlate;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer denizliExitKm;

    private Integer denizliEntryKm;

    private Integer totalKm;

    private BigDecimal exitFuelAmount;

    private BigDecimal tripFuelAmount;

    private BigDecimal totalFuelAmount;

    private BigDecimal weeklyAllowance;

    private BigDecimal commissionReceived;

    private BigDecimal extraReceived;

    private BigDecimal agiReceived;

    private String receiverName;

    private List<TripDailyExpenseResponse> dailyExpenses;

    private BigDecimal expenseTotal;

    private TripPrintTotalsResponse collectionTotals;

    private BigDecimal remainingCash;

    private List<TripPrintCollectionRowResponse> collectionRows;
}
