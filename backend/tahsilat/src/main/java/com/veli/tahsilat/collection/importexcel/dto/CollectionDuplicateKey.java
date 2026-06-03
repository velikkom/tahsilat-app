package com.veli.tahsilat.collection.importexcel.dto;

import com.veli.tahsilat.collection.enums.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Getter
@Builder
public class CollectionDuplicateKey {

    private UUID customerId;

    private BigDecimal amount;

    private LocalDate collectionDate;

    private PaymentType paymentType;

    private LocalDate maturityDate;

    public static CollectionDuplicateKey of(
            UUID customerId,
            BigDecimal amount,
            LocalDate collectionDate,
            PaymentType paymentType,
            LocalDate maturityDate
    ) {
        return CollectionDuplicateKey.builder()
                .customerId(customerId)
                .amount(normalizeAmount(amount))
                .collectionDate(collectionDate)
                .paymentType(paymentType)
                .maturityDate(resolveMaturityDateForKey(paymentType, maturityDate))
                .build();
    }

    public boolean requiresMaturityDateInKey() {
        return paymentType == PaymentType.CHECK
                || paymentType == PaymentType.PROMISSORY_NOTE;
    }

    private static LocalDate resolveMaturityDateForKey(
            PaymentType paymentType,
            LocalDate maturityDate
    ) {
        if (paymentType == PaymentType.CHECK
                || paymentType == PaymentType.PROMISSORY_NOTE) {
            return maturityDate;
        }

        return null;
    }

    private static BigDecimal normalizeAmount(BigDecimal amount) {
        return amount == null
                ? BigDecimal.ZERO
                : amount.setScale(2, java.math.RoundingMode.HALF_UP)
                        .stripTrailingZeros();
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) {
            return true;
        }

        if (!(object instanceof CollectionDuplicateKey that)) {
            return false;
        }

        return Objects.equals(customerId, that.customerId)
                && normalizeAmount(amount).compareTo(normalizeAmount(that.amount)) == 0
                && Objects.equals(collectionDate, that.collectionDate)
                && paymentType == that.paymentType
                && Objects.equals(maturityDate, that.maturityDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                customerId,
                normalizeAmount(amount),
                collectionDate,
                paymentType,
                maturityDate
        );
    }
}
