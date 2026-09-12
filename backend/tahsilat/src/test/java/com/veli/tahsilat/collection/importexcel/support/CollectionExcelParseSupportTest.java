package com.veli.tahsilat.collection.importexcel.support;

import com.veli.tahsilat.collection.enums.PaymentType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class CollectionExcelParseSupportTest {

    private final CollectionExcelParseSupport support = new CollectionExcelParseSupport();

    @Test
    void karlandMapsToMailOrderKarlandNotCreditCard() {
        assertEquals(PaymentType.MAIL_ORDER_KARLAND, support.mapPaymentType("Karland"));
        assertNotEquals(PaymentType.CREDIT_CARD, support.mapPaymentType("karland"));
    }

    @Test
    void otokocMapsToMailOrderOtokoc() {
        assertEquals(PaymentType.MAIL_ORDER_OTOKOC, support.mapPaymentType("Otokoç"));
        assertEquals(PaymentType.MAIL_ORDER_OTOKOC, support.mapPaymentType("otokoc"));
    }

    @Test
    void ykbMapsToPosYkb() {
        assertEquals(PaymentType.POS_YKB, support.mapPaymentType("YKB"));
        assertEquals(PaymentType.POS_YKB, support.mapPaymentType("Yapı Kredi"));
        assertEquals(PaymentType.POS_YKB, support.mapPaymentType("POS YKB"));
    }

    @Test
    void tebMapsToPosTeb() {
        assertEquals(PaymentType.POS_TEB, support.mapPaymentType("TEB"));
        assertEquals(PaymentType.POS_TEB, support.mapPaymentType("POS TEB"));
    }

    @Test
    void unknownValueStillDefaultsToCreditCard() {
        assertEquals(PaymentType.CREDIT_CARD, support.mapPaymentType("bilinmeyen deger"));
    }

    @Test
    void existingMappingsAreUnaffected() {
        assertEquals(PaymentType.CASH, support.mapPaymentType("Nakit"));
        assertEquals(PaymentType.CHECK, support.mapPaymentType("Müşteri Çeki"));
        assertEquals(PaymentType.PROMISSORY_NOTE, support.mapPaymentType("Müşteri Senedi"));
        assertEquals(PaymentType.BANK_TRANSFER, support.mapPaymentType("Havale"));
    }
}
