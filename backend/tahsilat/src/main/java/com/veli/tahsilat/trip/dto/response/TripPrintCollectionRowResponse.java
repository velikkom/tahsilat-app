package com.veli.tahsilat.trip.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One Form 1 (tahsilat dökümü) row. Mirrors the column routing in
 * TripCollectionDocumentGenerator#writeCollectionRow: each collection's
 * amount lands in exactly one of the typed fields below, matching its
 * paymentType. Mail Order is the card column.
 */
@Getter
@Builder
public class TripPrintCollectionRowResponse {

    private int siraNo;

    private String receiptNumber;

    private String mikroSr;

    private String mikroNo;

    private String customerName;

    private LocalDate collectionDate;

    private String bankName;

    private BigDecimal nakitTutari;

    private LocalDate senetVade;

    private BigDecimal senetTutar;

    private LocalDate cekVade;

    private BigDecimal cekTutar;

    private String mailorderFirma;

    private BigDecimal mailorder;

    private String havaleBanka;

    private BigDecimal havaleTutar;

    private BigDecimal posYkb;

    private BigDecimal posTeb;
}
