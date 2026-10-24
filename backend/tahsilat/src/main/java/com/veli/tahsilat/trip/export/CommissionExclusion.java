package com.veli.tahsilat.trip.export;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.PaymentType;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Primden düşülecek tutar, ödeme türüne göre ayrı tutulur.
 * Tur formuna elle yazılan tutar nakit satırına eklenir.
 */
public final class CommissionExclusion {

    private CommissionExclusion() {
    }

    public static Map<PaymentType, BigDecimal> byType(
            BigDecimal manualAmount,
            List<Collection> collections
    ) {
        Map<PaymentType, BigDecimal> amounts = new EnumMap<>(PaymentType.class);

        if (manualAmount != null && manualAmount.compareTo(BigDecimal.ZERO) != 0) {
            amounts.put(PaymentType.CASH, manualAmount);
        }

        if (collections == null) {
            return amounts;
        }

        for (Collection collection : collections) {
            if (!Boolean.TRUE.equals(collection.getExcludeFromCommission())) {
                continue;
            }

            if (collection.getAmount() == null || collection.getPaymentType() == null) {
                continue;
            }

            amounts.merge(collection.getPaymentType(), collection.getAmount(), BigDecimal::add);
        }

        return amounts;
    }

    public static BigDecimal total(BigDecimal manualAmount, List<Collection> collections) {
        BigDecimal total = BigDecimal.ZERO;

        for (BigDecimal amount : byType(manualAmount, collections).values()) {
            total = total.add(amount);
        }

        return total.compareTo(BigDecimal.ZERO) == 0 ? null : total;
    }
}
