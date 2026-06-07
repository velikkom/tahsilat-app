package com.veli.tahsilat.dashboard.controller;

import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.dashboard.dto.response.DashboardInsightsResponse;
import com.veli.tahsilat.dashboard.dto.response.DashboardMetricsResponse;
import com.veli.tahsilat.dashboard.dto.response.MonthPaymentBreakdownResponse;
import com.veli.tahsilat.dashboard.dto.response.MonthlyCollectionsResponse;
import com.veli.tahsilat.dashboard.dto.response.PaymentTypeCustomersResponse;
import com.veli.tahsilat.dashboard.dto.response.PaymentTypeDistributionResponse;
import com.veli.tahsilat.dashboard.dto.response.RecentCollectionsResponse;
import com.veli.tahsilat.dashboard.dto.response.TopCustomersResponse;
import com.veli.tahsilat.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Dashboard metric cards")
    @GetMapping("/metrics")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<DashboardMetricsResponse> getMetrics(
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(dashboardService.getMetrics(year));
    }

    @Operation(summary = "Monthly collections for a year")
    @GetMapping("/monthly-collections")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<MonthlyCollectionsResponse> getMonthlyCollections(
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(dashboardService.getMonthlyCollections(year));
    }

    @Operation(summary = "Payment type breakdown for a month")
    @GetMapping("/monthly-collections/payment-breakdown")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<MonthPaymentBreakdownResponse> getMonthPaymentBreakdown(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(dashboardService.getMonthPaymentBreakdown(year, month));
    }

    @Operation(summary = "Payment type distribution")
    @GetMapping("/payment-type-distribution")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<PaymentTypeDistributionResponse> getPaymentTypeDistribution(
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(dashboardService.getPaymentTypeDistribution(year));
    }

    @Operation(summary = "Top customers by payment type")
    @GetMapping("/payment-type-distribution/customers")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<PaymentTypeCustomersResponse> getPaymentTypeCustomers(
            @RequestParam PaymentType paymentType,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(
                dashboardService.getPaymentTypeCustomers(paymentType, year, limit)
        );
    }

    @Operation(summary = "Top customers by collection amount")
    @GetMapping("/top-customers")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<TopCustomersResponse> getTopCustomers(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(dashboardService.getTopCustomers(limit, year));
    }

    @Operation(summary = "Recent collections")
    @GetMapping("/recent-collections")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<RecentCollectionsResponse> getRecentCollections(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(dashboardService.getRecentCollections(limit, year));
    }

    @Operation(summary = "Dashboard insights")
    @GetMapping("/insights")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<DashboardInsightsResponse> getInsights(
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(dashboardService.getInsights(year));
    }
}
