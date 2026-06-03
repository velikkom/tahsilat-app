package com.veli.tahsilat.collection.importexcel.dto;

import com.veli.tahsilat.collection.enums.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class CollectionDuplicateKey {

    private UUID customerId;

    private BigDecimal amount;

    private LocalDate collectionDate;

    private PaymentType paymentType;

    public static CollectionDuplicateKey of(
            UUID customerId,
            BigDecimal amount,
            LocalDate collectionDate,
            PaymentType paymentType
    ) {
        return CollectionDuplicateKey.builder()
                .customerId(customerId)
                .amount(normalizeAmount(amount))
                .collectionDate(collectionDate)
                .paymentType(paymentType)
                .build();
    }

    private static BigDecimal normalizeAmount(BigDecimal amount) {
        return amount == null
                ? BigDecimal.ZERO
                : amount.stripTrailingZeros();
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) {
            return true;
        }

        if (!(object instanceof CollectionDuplicateKey that)) {
            return false;
        }

        return customerId.equals(that.customerId)
                && amount.compareTo(that.amount) == 0
                && collectionDate.equals(that.collectionDate)
                && paymentType == that.paymentType;
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(
                customerId,
                amount.stripTrailingZeros(),
                collectionDate,
                paymentType
        );
    }
}
