package com.veli.tahsilat.dashboard.service;

import com.veli.tahsilat.dashboard.dto.response.DashboardMetricsResponse;
import com.veli.tahsilat.dashboard.dto.response.MonthlyCollectionsResponse;
import com.veli.tahsilat.dashboard.dto.response.PaymentTypeDistributionResponse;
import com.veli.tahsilat.dashboard.dto.response.RecentCollectionsResponse;
import com.veli.tahsilat.dashboard.dto.response.TopCustomersResponse;

public interface DashboardService {

    DashboardMetricsResponse getMetrics();

    MonthlyCollectionsResponse getMonthlyCollections(Integer year);

    PaymentTypeDistributionResponse getPaymentTypeDistribution();

    TopCustomersResponse getTopCustomers(int limit);

    RecentCollectionsResponse getRecentCollections(int limit);
}
