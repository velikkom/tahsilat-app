package com.veli.tahsilat.report.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class DashboardSummaryResponse {

    private BigDecimal totalCollections;

    private BigDecimal pendingCollections;

    private BigDecimal paidCollections;

    private BigDecimal cashCollections;

    private BigDecimal checkCollections;
}