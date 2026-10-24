package com.veli.tahsilat.trip.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class CommissionExcludedByTypeResponse {

    private BigDecimal cash;

    private BigDecimal promissoryNote;

    private BigDecimal check;

    private BigDecimal mailOrder;

    private BigDecimal posYkb;

    private BigDecimal posTeb;

    private BigDecimal bankTransfer;
}
