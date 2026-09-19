package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class DashboardAgingResponse {

    private long overdueCount;

    private BigDecimal overdueAmount;

    private long dueTodayCount;

    private BigDecimal dueTodayAmount;

    private long upcomingCount;

    private BigDecimal upcomingAmount;
}
