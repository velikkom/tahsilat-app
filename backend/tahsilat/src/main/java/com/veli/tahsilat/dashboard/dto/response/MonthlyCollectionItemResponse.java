package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class MonthlyCollectionItemResponse {

    private Integer month;

    private String monthName;

    private BigDecimal totalAmount;

    private BigDecimal paidAmount;

    private BigDecimal unpaidAmount;

    private List<MonthlyPaymentTypeAmountResponse> paymentTypes;
}
