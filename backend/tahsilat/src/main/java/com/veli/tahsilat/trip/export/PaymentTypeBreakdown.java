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
        BigDecimal mailOrderKarland,
        BigDecimal mailOrderOtokoc,
        BigDecimal posYkb,
        BigDecimal posTeb
) {

    public BigDecimal genelToplam() {
        return cash
                .add(promissoryNote)
                .add(check)
                .add(bankTransfer)
                .add(mailOrderKarland)
                .add(mailOrderOtokoc)
                .add(posYkb)
                .add(posTeb);
    }

    public static PaymentTypeBreakdown fromCollections(List<Collection> collections) {
        BigDecimal cash = BigDecimal.ZERO;
        BigDecimal promissoryNote = BigDecimal.ZERO;
        BigDecimal check = BigDecimal.ZERO;
        BigDecimal bankTransfer = BigDecimal.ZERO;
        BigDecimal mailOrderKarland = BigDecimal.ZERO;
        BigDecimal mailOrderOtokoc = BigDecimal.ZERO;
        BigDecimal posYkb = BigDecimal.ZERO;
        BigDecimal posTeb = BigDecimal.ZERO;

        for (Collection collection : collections) {
            BigDecimal amount = collection.getAmount() == null ? BigDecimal.ZERO : collection.getAmount();

            switch (collection.getPaymentType()) {
                case CASH -> cash = cash.add(amount);
                case PROMISSORY_NOTE -> promissoryNote = promissoryNote.add(amount);
                case CHECK -> check = check.add(amount);
                case BANK_TRANSFER -> bankTransfer = bankTransfer.add(amount);
                case MAIL_ORDER_KARLAND -> mailOrderKarland = mailOrderKarland.add(amount);
                case MAIL_ORDER_OTOKOC -> mailOrderOtokoc = mailOrderOtokoc.add(amount);
                case POS_YKB -> posYkb = posYkb.add(amount);
                case POS_TEB -> posTeb = posTeb.add(amount);
                default -> {
                    // CREDIT_CARD and any other unmapped type: excluded on purpose.
                }
            }
        }

        return new PaymentTypeBreakdown(
                cash, promissoryNote, check, bankTransfer,
                mailOrderKarland, mailOrderOtokoc, posYkb, posTeb
        );
    }
}
