package com.veli.tahsilat.dashboard.controller;

import com.veli.tahsilat.dashboard.dto.response.DashboardMetricsResponse;
import com.veli.tahsilat.dashboard.dto.response.MonthlyCollectionsResponse;
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
    public ResponseEntity<DashboardMetricsResponse> getMetrics() {
        return ResponseEntity.ok(dashboardService.getMetrics());
    }

    @Operation(summary = "Monthly collections for a year")
    @GetMapping("/monthly-collections")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<MonthlyCollectionsResponse> getMonthlyCollections(
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(dashboardService.getMonthlyCollections(year));
    }

    @Operation(summary = "Payment type distribution")
    @GetMapping("/payment-type-distribution")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<PaymentTypeDistributionResponse> getPaymentTypeDistribution() {
        return ResponseEntity.ok(dashboardService.getPaymentTypeDistribution());
    }

    @Operation(summary = "Top customers by collection amount")
    @GetMapping("/top-customers")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<TopCustomersResponse> getTopCustomers(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(dashboardService.getTopCustomers(limit));
    }

    @Operation(summary = "Recent collections")
    @GetMapping("/recent-collections")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<RecentCollectionsResponse> getRecentCollections(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(dashboardService.getRecentCollections(limit));
    }
}
