package com.veli.tahsilat.dashboard.dto.response;

import com.veli.tahsilat.collection.enums.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class DashboardMetricsResponse {

    private BigDecimal totalCollectionsAmount;

    private BigDecimal currentMonthCollectionsAmount;

    private BigDecimal currentYearCollectionsAmount;

    private Long totalActiveCustomers;

    private String topCustomerCompanyName;

    private BigDecimal topCustomerTotalAmount;

    private PaymentType mostUsedPaymentType;

    private Long mostUsedPaymentTypeCount;
}
