package com.veli.tahsilat.report.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

import java.util.UUID;

@Getter
@Builder
public class CustomerFinancialSummaryResponse {

    private UUID customerId;

    private String customerName;

    private BigDecimal totalCollections;

    private BigDecimal cashCollections;

    private BigDecimal checkCollections;

    private Long totalCollectionCount;
}