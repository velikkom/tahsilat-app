package com.veli.tahsilat.report.controller;

import com.veli.tahsilat.collection.dto.response.CollectionResponse;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.report.dto.response.CustomerFinancialSummaryResponse;
import com.veli.tahsilat.report.dto.response.DashboardSummaryResponse;

import com.veli.tahsilat.report.dto.response.MonthlySummaryResponse;
import com.veli.tahsilat.report.service.ReportService;

import io.swagger.v3.oas.annotations.Operation;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(
            summary = "Dashboard summary report"
    )
    @GetMapping("/dashboard-summary")
    @PreAuthorize( "hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')" )

    public ResponseEntity<DashboardSummaryResponse>
    getDashboardSummary() {
        return ResponseEntity.ok(
                reportService
                        .getDashboardSummary()
        );
    }


    @Operation(
            summary = "Collections by payment type"
    )
    @GetMapping("/by-payment-type")
    @PreAuthorize(
            "hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')"
    )
    public ResponseEntity<Page<CollectionResponse>>getCollectionsByPaymentType(@RequestParam PaymentType paymentType,Pageable pageable) {
        return ResponseEntity.ok(
                reportService
                        .getCollectionsByPaymentType(
                                paymentType,
                                pageable
                        )
        );
    }

    @Operation(
            summary = "Customer financial summary"
    )
    @GetMapping("/customer-summary/{customerId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')"    )
    public ResponseEntity<CustomerFinancialSummaryResponse> getCustomerFinancialSummary(@PathVariable UUID customerId) {

        return ResponseEntity.ok(
                reportService
                        .getCustomerFinancialSummary(
                                customerId
                        )
        );
    }

    @Operation(
            summary = "Monthly summary report"
    )
    @GetMapping("/monthly-summary")
    @PreAuthorize(
            "hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')"
       )
    public ResponseEntity<MonthlySummaryResponse> getMonthlySummary(@RequestParam Integer year,@RequestParam Integer month) {

        return ResponseEntity.ok(
                reportService
                        .getMonthlySummary(
                                year,
                                month
                        )
        );
    }



}