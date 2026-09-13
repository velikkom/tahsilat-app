package com.veli.tahsilat.trip.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class TripPrintTotalsResponse {

    private BigDecimal cash;

    private BigDecimal promissoryNote;

    private BigDecimal check;

    private BigDecimal bankTransfer;

    private BigDecimal mailOrderKarland;

    private BigDecimal mailOrderOtokoc;

    private BigDecimal posYkb;

    private BigDecimal posTeb;

    private BigDecimal genelToplam;
}
