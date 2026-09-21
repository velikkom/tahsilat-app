package com.veli.tahsilat.collection.importexcel.support;

import com.veli.tahsilat.collection.enums.PaymentType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CollectionExcelParseSupportTest {

    private final CollectionExcelParseSupport support = new CollectionExcelParseSupport();

    @Test
    void karlandMapsToMailOrder() {
        assertEquals(PaymentType.MAIL_ORDER, support.mapPaymentType("Karland"));
        assertEquals(PaymentType.MAIL_ORDER, support.mapPaymentType("karland"));
    }

    @Test
    void otokocMapsToMailOrder() {
        assertEquals(PaymentType.MAIL_ORDER, support.mapPaymentType("Otokoç"));
        assertEquals(PaymentType.MAIL_ORDER, support.mapPaymentType("otokoc"));
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
    void unknownAndLegacyCardLabelsMapToMailOrder() {
        assertEquals(PaymentType.MAIL_ORDER, support.mapPaymentType("bilinmeyen deger"));
        assertEquals(PaymentType.MAIL_ORDER, support.mapPaymentType("Kredi Kartı"));
        assertEquals(PaymentType.MAIL_ORDER, support.mapPaymentType("credit card"));
        assertEquals(PaymentType.MAIL_ORDER, support.mapPaymentType("Mailorder"));
    }

    @Test
    void existingMappingsAreUnaffected() {
        assertEquals(PaymentType.CASH, support.mapPaymentType("Nakit"));
        assertEquals(PaymentType.CHECK, support.mapPaymentType("Müşteri Çeki"));
        assertEquals(PaymentType.PROMISSORY_NOTE, support.mapPaymentType("Müşteri Senedi"));
        assertEquals(PaymentType.BANK_TRANSFER, support.mapPaymentType("Havale"));
    }
}
