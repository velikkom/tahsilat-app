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

        List<Collection> allCollections =
                collectionRepository.findByActiveTrue();

        List<Collection> pendingCollections =
                collectionRepository
                        .findByStatusAndActiveTrue(
                                CollectionStatus.PENDING
                        );

        List<Collection> paidCollections =
                collectionRepository
                        .findByStatusAndActiveTrue(
                                CollectionStatus.PAID
                        );

        List<Collection> cashCollections =
                collectionRepository
                        .findByPaymentTypeAndActiveTrue(
                                PaymentType.CASH
                        );

        List<Collection> checkCollections =
                collectionRepository
                        .findByPaymentTypeAndActiveTrue(
                                PaymentType.CHECK
                        );

        BigDecimal totalAmount =  calculateTotal(allCollections);

        BigDecimal pendingAmount = calculateTotal(pendingCollections);

        BigDecimal paidAmount = calculateTotal(paidCollections);

        BigDecimal cashAmount = calculateTotal(cashCollections);

        BigDecimal checkAmount = calculateTotal(checkCollections);

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

        List<Collection> allCollections =
                collectionRepository
                        .findByCustomerIdAndActiveTrue(
                                customerId
                        );

        List<Collection> cashCollections =
                collectionRepository
                        .findByCustomerIdAndPaymentTypeAndActiveTrue(
                                customerId,
                                PaymentType.CASH
                        );

        List<Collection> checkCollections =
                collectionRepository
                        .findByCustomerIdAndPaymentTypeAndActiveTrue(
                                customerId,
                                PaymentType.CHECK
                        );

        return CustomerFinancialSummaryResponse
                .builder()
                .customerId(customer.getId())
                .customerName(customer.getCompanyName())
                .totalCollections(
                        calculateTotal(allCollections)
                )
                .cashCollections(
                        calculateTotal(cashCollections)
                )
                .checkCollections(
                        calculateTotal(checkCollections)
                )

                .totalCollectionCount(
                        (long) allCollections.size()
                )

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