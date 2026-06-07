package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class MonthPaymentBreakdownResponse {

    private Integer year;

    private Integer month;

    private String monthName;

    private BigDecimal totalAmount;

    private List<PaymentTypeAmountItemResponse> items;
}
