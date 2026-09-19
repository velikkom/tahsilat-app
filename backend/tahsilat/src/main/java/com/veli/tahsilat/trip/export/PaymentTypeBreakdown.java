package com.veli.tahsilat.trip.export;

import com.veli.tahsilat.collection.entity.Collection;

import java.math.BigDecimal;
import java.util.List;

/**
 * Per-payment-type totals shared by the trip print preview's Form 1 total
 * row and Form 2 collection summary block. CREDIT_CARD (and any future
 * unmapped type) is intentionally excluded from every bucket and from
 * genelToplam() - same rule as the Form 1/2 xlsx generators.
 */
public record PaymentTypeBreakdown(
        BigDecimal cash,
        BigDecimal promissoryNote,
        BigDecimal check,
        BigDecimal bankTransfer,
        BigDecimal mailOrder,
        BigDecimal posYkb,
        BigDecimal posTeb
) {

    public BigDecimal genelToplam() {
        return cash
                .add(promissoryNote)
                .add(check)
                .add(bankTransfer)
                .add(mailOrder)
                .add(posYkb)
                .add(posTeb);
    }

    /**
     * Rows that belong on the paper form: active customer, and a payment
     * type that has a column. CREDIT_CARD is stored for the collection
     * list but has no form slot, so keeping it would leave a customer
     * name with a blank amount after the real tahsilat is gone.
     */
    public static boolean appearsOnDocument(Collection collection) {
        if (collection == null || collection.getPaymentType() == null) {
            return false;
        }

        if (collection.getCustomer() != null
                && !Boolean.TRUE.equals(collection.getCustomer().getActive())) {
            return false;
        }

        return switch (collection.getPaymentType()) {
            case CASH, PROMISSORY_NOTE, CHECK, BANK_TRANSFER, MAIL_ORDER, POS_YKB, POS_TEB -> true;
            case CREDIT_CARD -> false;
        };
    }

    public static List<Collection> appearingOnDocument(List<Collection> collections) {
        if (collections == null || collections.isEmpty()) {
            return List.of();
        }

        return collections.stream().filter(PaymentTypeBreakdown::appearsOnDocument).toList();
    }

    public static PaymentTypeBreakdown fromCollections(List<Collection> collections) {
        BigDecimal cash = BigDecimal.ZERO;
        BigDecimal promissoryNote = BigDecimal.ZERO;
        BigDecimal check = BigDecimal.ZERO;
        BigDecimal bankTransfer = BigDecimal.ZERO;
        BigDecimal mailOrder = BigDecimal.ZERO;
        BigDecimal posYkb = BigDecimal.ZERO;
        BigDecimal posTeb = BigDecimal.ZERO;

        for (Collection collection : appearingOnDocument(collections)) {
            BigDecimal amount = collection.getAmount() == null ? BigDecimal.ZERO : collection.getAmount();

            switch (collection.getPaymentType()) {
                case CASH -> cash = cash.add(amount);
                case PROMISSORY_NOTE -> promissoryNote = promissoryNote.add(amount);
                case CHECK -> check = check.add(amount);
                case BANK_TRANSFER -> bankTransfer = bankTransfer.add(amount);
                case MAIL_ORDER -> mailOrder = mailOrder.add(amount);
                case POS_YKB -> posYkb = posYkb.add(amount);
                case POS_TEB -> posTeb = posTeb.add(amount);
                default -> {
                    // CREDIT_CARD and any other unmapped type: excluded on purpose.
                }
            }
        }

        return new PaymentTypeBreakdown(
                cash, promissoryNote, check, bankTransfer,
                mailOrder, posYkb, posTeb
        );
    }
}
