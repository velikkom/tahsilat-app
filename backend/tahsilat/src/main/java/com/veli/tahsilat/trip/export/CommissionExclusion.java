package com.veli.tahsilat.trip.export;

import com.veli.tahsilat.collection.entity.Collection;

import java.math.BigDecimal;
import java.util.List;

/**
 * Primden düşülecek tutar: tur formundaki elle girilen tutar ile,
 * tahsilat eklerken işaretlenen kayıtların tutarları.
 */
public final class CommissionExclusion {

    private CommissionExclusion() {
    }

    public static BigDecimal total(BigDecimal manualAmount, List<Collection> collections) {
        BigDecimal total = manualAmount == null ? BigDecimal.ZERO : manualAmount;

        if (collections != null) {
            for (Collection collection : collections) {
                if (!Boolean.TRUE.equals(collection.getExcludeFromCommission())) {
                    continue;
                }

                if (collection.getAmount() != null) {
                    total = total.add(collection.getAmount());
                }
            }
        }

        return total.compareTo(BigDecimal.ZERO) == 0 ? null : total;
    }
}
