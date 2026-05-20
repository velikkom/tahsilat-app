package com.veli.tahsilat.report.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class MonthlySummaryResponse {

    private Integer year;

    private Integer month;

    private BigDecimal totalCollections;

    private Long totalCollectionCount;

    private BigDecimal cashCollections;

    private BigDecimal checkCollections;
}