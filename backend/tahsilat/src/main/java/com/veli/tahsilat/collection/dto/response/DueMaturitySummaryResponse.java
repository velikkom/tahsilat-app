package com.veli.tahsilat.collection.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class DueMaturitySummaryResponse {

    private long count;

    private BigDecimal amount;
}
