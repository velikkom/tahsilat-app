package com.veli.tahsilat.trip.export;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.trip.dto.response.CommissionExcludedByTypeResponse;
import com.veli.tahsilat.trip.dto.response.TripPrintCollectionRowResponse;
import com.veli.tahsilat.trip.dto.response.TripPrintPreviewResponse;
import com.veli.tahsilat.trip.dto.response.TripPrintTotalsResponse;
import com.veli.tahsilat.trip.entity.Trip;
import com.veli.tahsilat.trip.entity.TripDailyExpense;
import com.veli.tahsilat.trip.mapper.TripMapper;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Builds the /print-preview payload (on-screen Form 1 + Form 2). Reuses
 * PaymentTypeBreakdown for the totals shared by both forms, and mirrors -
 * without modifying - the column routing and remaining-cash formula from
 * TripCollectionDocumentGenerator / TripExpenseDocumentGenerator so the
 * preview always agrees with the xlsx exports.
 */
@Component
@RequiredArgsConstructor
public class TripPrintPreviewBuilder {

    private final TripMapper tripMapper;

    public TripPrintPreviewResponse build(Trip trip, List<Collection> collections) {
        List<Collection> rows = PaymentTypeBreakdown.appearingOnDocument(collections);
        PaymentTypeBreakdown breakdown = PaymentTypeBreakdown.fromCollections(rows);
        Map<PaymentType, BigDecimal> excludedByType = CommissionExclusion.byType(
                trip.getCommissionExcludedAmount(),
                rows
        );

        BigDecimal expenseTotal = totalExpenses(trip.getDailyExpenses());
        BigDecimal remainingCash = breakdown.cash()
                .subtract(expenseTotal)
                .subtract(nvl(trip.getWeeklyAllowance()))
                .subtract(nvl(trip.getCommissionReceived()))
                .subtract(nvl(trip.getExtraReceived()))
                .subtract(nvl(trip.getAgiReceived()));

        String salesmanName = trip.getSalesman() == null
                ? null
                : (trip.getSalesman().getFirstName() + " " + trip.getSalesman().getLastName()).trim();

        return TripPrintPreviewResponse.builder()
                .id(trip.getId())
                .salesmanName(salesmanName)
                .vehiclePlate(trip.getVehiclePlate())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .denizliExitKm(trip.getDenizliExitKm())
                .denizliEntryKm(trip.getDenizliEntryKm())
                .totalKm(totalKm(trip))
                .exitFuelAmount(trip.getExitFuelAmount())
                .tripFuelAmount(trip.getTripFuelAmount())
                .totalFuelAmount(nvl(trip.getExitFuelAmount()).add(nvl(trip.getTripFuelAmount())))
                .weeklyAllowance(trip.getWeeklyAllowance())
                .commissionExcludedAmount(sumExcluded(excludedByType))
                .commissionExcludedByType(toExcludedByType(excludedByType))
                .commissionReceived(trip.getCommissionReceived())
                .extraReceived(trip.getExtraReceived())
                .agiReceived(trip.getAgiReceived())
                .receiverName(trip.getReceiverName())
                .dailyExpenses(trip.getDailyExpenses().stream().map(tripMapper::toDailyExpenseResponse).toList())
                .expenseTotal(expenseTotal)
                .collectionTotals(toTotalsResponse(breakdown))
                .remainingCash(remainingCash)
                .collectionRows(toRows(rows))
                .build();
    }

    private TripPrintTotalsResponse toTotalsResponse(PaymentTypeBreakdown breakdown) {
        return TripPrintTotalsResponse.builder()
                .cash(breakdown.cash())
                .promissoryNote(breakdown.promissoryNote())
                .check(breakdown.check())
                .bankTransfer(breakdown.bankTransfer())
                .mailOrder(breakdown.mailOrder())
                .posYkb(breakdown.posYkb())
                .posTeb(breakdown.posTeb())
                .genelToplam(breakdown.genelToplam())
                .build();
    }

    private List<TripPrintCollectionRowResponse> toRows(List<Collection> collections) {
        List<TripPrintCollectionRowResponse> rows = new java.util.ArrayList<>();
        int siraNo = 1;

        for (Collection collection : collections) {
            rows.add(toRow(siraNo, collection));
            siraNo++;
        }

        return rows;
    }

    private TripPrintCollectionRowResponse toRow(int siraNo, Collection collection) {
        TripPrintCollectionRowResponse.TripPrintCollectionRowResponseBuilder row = TripPrintCollectionRowResponse.builder()
                .siraNo(siraNo)
                .receiptNumber(collection.getReceiptNumber())
                .mikroSr(collection.getMikroSr())
                .mikroNo(collection.getMikroNo())
                .customerName(collection.getCustomer() == null ? null : collection.getCustomer().getCompanyName())
                .collectionDate(collection.getCollectionDate())
                .bankName(collection.getBankName())
                .excludeFromCommission(Boolean.TRUE.equals(collection.getExcludeFromCommission()));

        PaymentType paymentType = collection.getPaymentType();
        BigDecimal amount = collection.getAmount();

        if (paymentType == PaymentType.CASH) {
            row.nakitTutari(amount);
        } else if (paymentType == PaymentType.PROMISSORY_NOTE) {
            row.senetVade(collection.getMaturityDate()).senetTutar(amount);
        } else if (paymentType == PaymentType.CHECK) {
            row.cekVade(collection.getMaturityDate()).cekTutar(amount);
        } else if (paymentType == PaymentType.BANK_TRANSFER) {
            row.havaleBanka(collection.getBankName()).havaleTutar(amount);
        } else if (paymentType == PaymentType.MAIL_ORDER) {
            row.mailorderFirma(collection.getMailOrderCompany()).mailorder(amount);
        } else if (paymentType == PaymentType.POS_YKB) {
            row.posYkb(amount);
        } else if (paymentType == PaymentType.POS_TEB) {
            row.posTeb(amount);
        }

        return row.build();
    }

    private Integer totalKm(Trip trip) {
        if (trip.getDenizliExitKm() == null || trip.getDenizliEntryKm() == null) {
            return null;
        }

        return trip.getDenizliEntryKm() - trip.getDenizliExitKm();
    }

    private BigDecimal totalExpenses(List<TripDailyExpense> dailyExpenses) {
        BigDecimal total = BigDecimal.ZERO;

        for (TripDailyExpense expense : dailyExpenses) {
            total = total
                    .add(nvl(expense.getMealAmount()))
                    .add(nvl(expense.getHotelAmount()))
                    .add(nvl(expense.getFuelInvoiceAmount()))
                    .add(nvl(expense.getOtherAmount()));
        }

        return total;
    }

    private BigDecimal sumExcluded(Map<PaymentType, BigDecimal> excludedByType) {
        BigDecimal total = BigDecimal.ZERO;

        for (BigDecimal amount : excludedByType.values()) {
            total = total.add(amount);
        }

        return total.compareTo(BigDecimal.ZERO) == 0 ? null : total;
    }

    private CommissionExcludedByTypeResponse toExcludedByType(Map<PaymentType, BigDecimal> excludedByType) {
        return CommissionExcludedByTypeResponse.builder()
                .cash(excludedByType.get(PaymentType.CASH))
                .promissoryNote(excludedByType.get(PaymentType.PROMISSORY_NOTE))
                .check(excludedByType.get(PaymentType.CHECK))
                .mailOrder(excludedByType.get(PaymentType.MAIL_ORDER))
                .posYkb(excludedByType.get(PaymentType.POS_YKB))
                .posTeb(excludedByType.get(PaymentType.POS_TEB))
                .bankTransfer(excludedByType.get(PaymentType.BANK_TRANSFER))
                .build();
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
