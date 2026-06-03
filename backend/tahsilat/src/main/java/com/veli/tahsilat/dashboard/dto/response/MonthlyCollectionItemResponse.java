package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class MonthlyCollectionItemResponse {

    private Integer month;

    private String monthName;

    private BigDecimal totalAmount;
}
