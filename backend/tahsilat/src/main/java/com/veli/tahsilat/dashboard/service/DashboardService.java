package com.veli.tahsilat.dashboard.service;

import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.dashboard.dto.response.DashboardInsightsResponse;
import com.veli.tahsilat.dashboard.dto.response.DashboardMetricsResponse;
import com.veli.tahsilat.dashboard.dto.response.MonthPaymentBreakdownResponse;
import com.veli.tahsilat.dashboard.dto.response.MonthlyCollectionsResponse;
import com.veli.tahsilat.dashboard.dto.response.PaymentTypeCustomersResponse;
import com.veli.tahsilat.dashboard.dto.response.PaymentTypeDistributionResponse;
import com.veli.tahsilat.dashboard.dto.response.RecentCollectionsResponse;
import com.veli.tahsilat.dashboard.dto.response.TopCustomersResponse;

public interface DashboardService {

    DashboardMetricsResponse getMetrics(Integer year);

    MonthlyCollectionsResponse getMonthlyCollections(Integer year);

    PaymentTypeDistributionResponse getPaymentTypeDistribution(Integer year);

    TopCustomersResponse getTopCustomers(int limit, Integer year);

    RecentCollectionsResponse getRecentCollections(int limit, Integer year);

    MonthPaymentBreakdownResponse getMonthPaymentBreakdown(int year, int month);

    PaymentTypeCustomersResponse getPaymentTypeCustomers(
            PaymentType paymentType,
            Integer year,
            int limit
    );

    DashboardInsightsResponse getInsights(Integer year);
}
