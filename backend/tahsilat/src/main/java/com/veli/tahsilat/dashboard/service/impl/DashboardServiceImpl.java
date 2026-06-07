package com.veli.tahsilat.dashboard.service.impl;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.mapper.CollectionMapper;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.customer.repository.CustomerRepository;
import com.veli.tahsilat.dashboard.dto.response.DashboardInsightsResponse;
import com.veli.tahsilat.dashboard.dto.response.DashboardMetricsResponse;
import com.veli.tahsilat.dashboard.dto.response.MonthPaymentBreakdownResponse;
import com.veli.tahsilat.dashboard.dto.response.MonthlyCollectionItemResponse;
import com.veli.tahsilat.dashboard.dto.response.MonthlyCollectionsResponse;
import com.veli.tahsilat.dashboard.dto.response.PaymentTypeAmountItemResponse;
import com.veli.tahsilat.dashboard.dto.response.PaymentTypeCustomersResponse;
import com.veli.tahsilat.dashboard.dto.response.PaymentTypeDistributionItemResponse;
import com.veli.tahsilat.dashboard.dto.response.PaymentTypeDistributionResponse;
import com.veli.tahsilat.dashboard.dto.response.RecentCollectionsResponse;
import com.veli.tahsilat.dashboard.dto.response.TopCustomerItemResponse;
import com.veli.tahsilat.dashboard.dto.response.TopCustomersResponse;
import com.veli.tahsilat.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final String[] TURKISH_MONTH_NAMES = {
            "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    };

    private final CollectionRepository collectionRepository;
    private final CustomerRepository customerRepository;
    private final CollectionMapper collectionMapper;

    @Override
    public DashboardMetricsResponse getMetrics(Integer year) {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        LocalDate yearStart = year != null
                ? LocalDate.of(year, 1, 1)
                : LocalDate.of(today.getYear(), 1, 1);
        LocalDate yearEnd = year != null
                ? LocalDate.of(year, 12, 31)
                : LocalDate.of(today.getYear(), 12, 31);

        BigDecimal totalAmount = nullSafe(
                collectionRepository.sumAmountByActiveTrueAndOptionalYear(year)
        );

        BigDecimal monthAmount = BigDecimal.ZERO;

        if (year == null || year == today.getYear()) {
            monthAmount = nullSafe(
                    collectionRepository.sumAmountByActiveTrueAndCollectionDateBetweenAndOptionalYear(
                            currentMonth.atDay(1),
                            currentMonth.atEndOfMonth(),
                            year
                    )
            );
        }

        BigDecimal yearAmount = nullSafe(
                collectionRepository.sumAmountByActiveTrueAndCollectionDateBetweenAndOptionalYear(
                        yearStart,
                        yearEnd,
                        year
                )
        );

        long totalCustomers = customerRepository.countByActiveTrue();

        List<Object[]> topCustomersRaw = collectionRepository.findTopCustomersByAmountAndOptionalYear(
                year,
                PageRequest.of(0, 1)
        );

        String topCustomerName = null;
        BigDecimal topCustomerAmount = BigDecimal.ZERO;

        if (!topCustomersRaw.isEmpty()) {
            Object[] row = topCustomersRaw.get(0);
            topCustomerName = (String) row[1];
            topCustomerAmount = (BigDecimal) row[2];
        }

        PaymentType mostUsedPaymentType = null;
        Long mostUsedPaymentTypeCount = 0L;

        List<Object[]> paymentTypeRows =
                collectionRepository.findPaymentTypeDistributionRawByOptionalYear(year);

        if (!paymentTypeRows.isEmpty()) {
            Object[] row = paymentTypeRows.get(0);
            mostUsedPaymentType = (PaymentType) row[0];
            mostUsedPaymentTypeCount = (Long) row[1];
        }

        return DashboardMetricsResponse.builder()
                .totalCollectionsAmount(totalAmount)
                .currentMonthCollectionsAmount(monthAmount)
                .currentYearCollectionsAmount(yearAmount)
                .totalActiveCustomers(totalCustomers)
                .topCustomerCompanyName(topCustomerName)
                .topCustomerTotalAmount(topCustomerAmount)
                .mostUsedPaymentType(mostUsedPaymentType)
                .mostUsedPaymentTypeCount(mostUsedPaymentTypeCount)
                .build();
    }

    @Override
    public MonthlyCollectionsResponse getMonthlyCollections(Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();

        List<Object[]> rawRows =
                collectionRepository.sumAmountGroupByMonthForYear(targetYear);

        Map<Integer, BigDecimal> monthTotals = new HashMap<>();

        for (Object[] row : rawRows) {
            int month = ((Number) row[0]).intValue();
            BigDecimal amount = (BigDecimal) row[1];
            monthTotals.put(month, amount);
        }

        List<MonthlyCollectionItemResponse> months = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            months.add(
                    MonthlyCollectionItemResponse.builder()
                            .month(month)
                            .monthName(TURKISH_MONTH_NAMES[month - 1])
                            .totalAmount(
                                    monthTotals.getOrDefault(
                                            month,
                                            BigDecimal.ZERO
                                    )
                            )
                            .build()
            );
        }

        return MonthlyCollectionsResponse.builder()
                .year(targetYear)
                .months(months)
                .build();
    }

    @Override
    public PaymentTypeDistributionResponse getPaymentTypeDistribution(Integer year) {
        List<Object[]> rawRows =
                collectionRepository.findPaymentTypeDistributionRawByOptionalYear(year);

        BigDecimal grandTotal = rawRows.stream()
                .map(row -> (BigDecimal) row[2])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<PaymentTypeDistributionItemResponse> items = rawRows.stream()
                .map(row -> {
                    PaymentType paymentType = (PaymentType) row[0];
                    Long count = (Long) row[1];
                    BigDecimal amount = (BigDecimal) row[2];

                    double percentage = 0.0;

                    if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
                        percentage = amount
                                .multiply(BigDecimal.valueOf(100))
                                .divide(
                                        grandTotal,
                                        2,
                                        RoundingMode.HALF_UP
                                )
                                .doubleValue();
                    }

                    return PaymentTypeDistributionItemResponse.builder()
                            .paymentType(paymentType)
                            .count(count)
                            .totalAmount(amount)
                            .percentage(percentage)
                            .build();
                })
                .toList();

        return PaymentTypeDistributionResponse.builder()
                .items(items)
                .build();
    }

    @Override
    public TopCustomersResponse getTopCustomers(int limit, Integer year) {
        int pageSize = Math.max(1, Math.min(limit, 50));

        List<Object[]> rawRows = collectionRepository.findTopCustomersByAmountAndOptionalYear(
                year,
                PageRequest.of(0, pageSize)
        );

        List<TopCustomerItemResponse> customers = rawRows.stream()
                .map(row ->
                        TopCustomerItemResponse.builder()
                                .customerId((UUID) row[0])
                                .companyName((String) row[1])
                                .totalAmount((BigDecimal) row[2])
                                .build()
                )
                .toList();

        return TopCustomersResponse.builder()
                .customers(customers)
                .build();
    }

    @Override
    public RecentCollectionsResponse getRecentCollections(int limit, Integer year) {
        int pageSize = Math.max(1, Math.min(limit, 50));

        List<Collection> collections = collectionRepository
                .findByActiveTrueAndOptionalYearOrderByCreatedAtDesc(
                        year,
                        PageRequest.of(0, pageSize)
                )
                .getContent();

        return RecentCollectionsResponse.builder()
                .collections(
                        collections.stream()
                                .map(collectionMapper::toResponse)
                                .toList()
                )
                .build();
    }

    @Override
    public MonthPaymentBreakdownResponse getMonthPaymentBreakdown(int year, int month) {
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Month must be between 1 and 12");
        }

        List<Object[]> rawRows = collectionRepository.sumAmountGroupByPaymentTypeForMonth(
                year,
                month
        );

        List<PaymentTypeAmountItemResponse> items = rawRows.stream()
                .map(row ->
                        PaymentTypeAmountItemResponse.builder()
                                .paymentType((PaymentType) row[0])
                                .totalAmount((BigDecimal) row[1])
                                .build()
                )
                .toList();

        BigDecimal totalAmount = items.stream()
                .map(PaymentTypeAmountItemResponse::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return MonthPaymentBreakdownResponse.builder()
                .year(year)
                .month(month)
                .monthName(TURKISH_MONTH_NAMES[month - 1])
                .totalAmount(totalAmount)
                .items(items)
                .build();
    }

    @Override
    public PaymentTypeCustomersResponse getPaymentTypeCustomers(
            PaymentType paymentType,
            Integer year,
            int limit
    ) {
        int pageSize = Math.max(1, Math.min(limit, 50));

        List<Object[]> rawRows = collectionRepository.findTopCustomersByPaymentTypeAndOptionalYear(
                paymentType,
                year,
                PageRequest.of(0, pageSize)
        );

        List<TopCustomerItemResponse> customers = rawRows.stream()
                .map(row ->
                        TopCustomerItemResponse.builder()
                                .customerId((UUID) row[0])
                                .companyName((String) row[1])
                                .totalAmount((BigDecimal) row[2])
                                .build()
                )
                .toList();

        return PaymentTypeCustomersResponse.builder()
                .paymentType(paymentType)
                .year(year)
                .customers(customers)
                .build();
    }

    @Override
    public DashboardInsightsResponse getInsights(Integer year) {
        List<Object[]> paymentTypeRows =
                collectionRepository.findPaymentTypeDistributionRawByOptionalYear(year);

        PaymentType mostUsedPaymentType = null;

        if (!paymentTypeRows.isEmpty()) {
            mostUsedPaymentType = (PaymentType) paymentTypeRows.get(0)[0];
        }

        List<Object[]> topCustomersRaw = collectionRepository.findTopCustomersByAmountAndOptionalYear(
                year,
                PageRequest.of(0, 1)
        );

        String topCustomerName = null;
        BigDecimal topCustomerAmount = BigDecimal.ZERO;

        if (!topCustomersRaw.isEmpty()) {
            Object[] row = topCustomersRaw.get(0);
            topCustomerName = (String) row[1];
            topCustomerAmount = (BigDecimal) row[2];
        }

        int targetYear = year != null ? year : LocalDate.now().getYear();
        MonthlyCollectionsResponse monthlyData = getMonthlyCollections(targetYear);

        int highestMonth = 0;
        String highestMonthName = null;
        BigDecimal highestMonthAmount = BigDecimal.ZERO;

        for (MonthlyCollectionItemResponse item : monthlyData.getMonths()) {
            if (item.getTotalAmount().compareTo(highestMonthAmount) > 0) {
                highestMonthAmount = item.getTotalAmount();
                highestMonth = item.getMonth();
                highestMonthName = item.getMonthName();
            }
        }

        return DashboardInsightsResponse.builder()
                .filterYear(year)
                .mostUsedPaymentType(mostUsedPaymentType)
                .topCustomerCompanyName(topCustomerName)
                .topCustomerTotalAmount(topCustomerAmount)
                .highestMonth(highestMonth)
                .highestMonthName(highestMonthName)
                .highestMonthTotalAmount(highestMonthAmount)
                .build();
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
