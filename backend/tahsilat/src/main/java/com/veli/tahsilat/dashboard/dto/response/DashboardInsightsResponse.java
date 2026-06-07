package com.veli.tahsilat.dashboard.dto.response;

import com.veli.tahsilat.collection.enums.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class DashboardInsightsResponse {

    private Integer filterYear;

    private PaymentType mostUsedPaymentType;

    private String topCustomerCompanyName;

    private BigDecimal topCustomerTotalAmount;

    private Integer highestMonth;

    private String highestMonthName;

    private BigDecimal highestMonthTotalAmount;
}
