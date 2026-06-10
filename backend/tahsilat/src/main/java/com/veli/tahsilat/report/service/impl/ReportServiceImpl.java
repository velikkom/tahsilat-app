package com.veli.tahsilat.report.service.impl;

import com.veli.tahsilat.collection.dto.response.CollectionResponse;
import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.mapper.CollectionMapper;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.report.dto.response.DashboardSummaryResponse;
import com.veli.tahsilat.report.dto.response.MonthlySummaryResponse;
import com.veli.tahsilat.report.service.ReportService;
import com.veli.tahsilat.report.dto.response.CustomerFinancialSummaryResponse;

import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;

import com.veli.tahsilat.common.exception.ResourceNotFoundException;

import com.veli.tahsilat.report.dto.response.MonthlySummaryResponse;

import java.time.LocalDate;
import java.time.YearMonth;

import java.util.UUID;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final CollectionRepository collectionRepository;
    private final CollectionMapper collectionMapper;
    private final CustomerRepository customerRepository;

    @Override
    public DashboardSummaryResponse getDashboardSummary() {

        BigDecimal totalAmount =
                collectionRepository.sumAmountByActiveTrue();

        BigDecimal pendingAmount =
                collectionRepository.sumAmountByStatusAndActiveTrue(
                        CollectionStatus.PENDING
                );

        BigDecimal paidAmount =
                collectionRepository.sumAmountByStatusAndActiveTrue(
                        CollectionStatus.PAID
                );

        BigDecimal cashAmount =
                collectionRepository.sumAmountByPaymentTypeAndActiveTrue(
                        PaymentType.CASH
                );

        BigDecimal checkAmount =
                collectionRepository.sumAmountByPaymentTypeAndActiveTrue(
                        PaymentType.CHECK
                );

        return DashboardSummaryResponse
                .builder()
                .totalCollections(totalAmount)
                .pendingCollections(pendingAmount)
                .paidCollections(paidAmount)
                .cashCollections(cashAmount)
                .checkCollections(checkAmount)
                .build();
    }

    @Override
    public Page<CollectionResponse> getCollectionsByPaymentType(PaymentType paymentType, Pageable pageable) {
        return collectionRepository.findByPaymentTypeAndActiveTrue(
                paymentType,
                pageable
        ).map(collectionMapper::toResponse);
    }

    private BigDecimal calculateTotal(List<Collection> collections) {
        return collections.stream()
                .map(Collection::getAmount)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    @Override
    public CustomerFinancialSummaryResponse getCustomerFinancialSummary(UUID customerId) {
        Customer customer =
                customerRepository.findByIdAndActiveTrue(customerId)
                        .orElseThrow(
                                () -> new ResourceNotFoundException( "Customer not found")
                        );

        BigDecimal totalAmount =
                collectionRepository.sumAmountByCustomerIdAndActiveTrue(
                        customerId
                );

        BigDecimal cashAmount =
                collectionRepository.sumAmountByCustomerIdAndPaymentTypeAndActiveTrue(
                        customerId,
                        PaymentType.CASH
                );

        BigDecimal checkAmount =
                collectionRepository.sumAmountByCustomerIdAndPaymentTypeAndActiveTrue(
                        customerId,
                        PaymentType.CHECK
                );

        long totalCount =
                collectionRepository.countByCustomerIdAndActiveTrue(
                        customerId
                );

        return CustomerFinancialSummaryResponse
                .builder()
                .customerId(customer.getId())
                .customerName(customer.getCompanyName())
                .totalCollections(totalAmount)
                .cashCollections(cashAmount)
                .checkCollections(checkAmount)
                .totalCollectionCount(totalCount)
                .build();
    }

    @Override
    public MonthlySummaryResponse getMonthlySummary(Integer year,Integer month) {

        YearMonth yearMonth =
                YearMonth.of(year, month);
        LocalDate startDate =
                yearMonth.atDay(1);
        LocalDate endDate =
                yearMonth.atEndOfMonth();
        List<Collection> monthlyCollections =
                collectionRepository
                        .findByCollectionDateBetweenAndActiveTrue(
                                startDate,
                                endDate
                        );

        BigDecimal totalCollections =
                calculateTotal(monthlyCollections);

        BigDecimal cashCollections =
                calculateTotal(
                        monthlyCollections.stream()
                                .filter(collection ->
                                        collection.getPaymentType()
                                                == PaymentType.CASH
                                )
                                .toList()
                );

        BigDecimal checkCollections =
                calculateTotal(
                        monthlyCollections.stream()
                                .filter(collection ->
                                        collection.getPaymentType()
                                                == PaymentType.CHECK
                                )
                                .toList()
                );
        return MonthlySummaryResponse
                .builder()
                .year(year)
                .month(month)
                .totalCollections(totalCollections)
                .totalCollectionCount(
                        (long) monthlyCollections.size()
                )
                .cashCollections(cashCollections)
                .checkCollections(checkCollections)
                .build();
    }
}