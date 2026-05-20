package com.veli.tahsilat.report.service;

import com.veli.tahsilat.collection.dto.response.CollectionResponse;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.report.dto.response.CustomerFinancialSummaryResponse;
import com.veli.tahsilat.report.dto.response.DashboardSummaryResponse;
import com.veli.tahsilat.report.dto.response.MonthlySummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ReportService {

    DashboardSummaryResponse getDashboardSummary();

    Page<CollectionResponse> getCollectionsByPaymentType(
            PaymentType paymentType,
            Pageable pageable
    );

    CustomerFinancialSummaryResponse getCustomerFinancialSummary(UUID customerId);

    MonthlySummaryResponse getMonthlySummary(
            Integer year,
            Integer month
    );



}