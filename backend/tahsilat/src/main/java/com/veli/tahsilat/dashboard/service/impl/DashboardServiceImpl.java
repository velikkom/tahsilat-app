package com.veli.tahsilat.dashboard.service.impl;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.mapper.CollectionMapper;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.customer.repository.CustomerRepository;
import com.veli.tahsilat.dashboard.dto.response.DashboardAgingResponse;
import com.veli.tahsilat.dashboard.dto.response.DashboardInsightsResponse;
import com.veli.tahsilat.dashboard.dto.response.DashboardMetricsResponse;
import com.veli.tahsilat.dashboard.dto.response.MailOrderCompanyAmountItemResponse;
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
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
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

    private static final List<PaymentType> MATURITY_PAYMENT_TYPES = List.of(
            PaymentType.CHECK,
            PaymentType.PROMISSORY_NOTE
    );

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

        BigDecimal paidAmount = nullSafe(
                collectionRepository.sumAmountByStatusAndActiveTrue(CollectionStatus.PAID)
        );
        BigDecimal unpaidAmount = nullSafe(
                collectionRepository.sumAmountByStatusAndActiveTrue(CollectionStatus.PENDING)
        );

        return DashboardMetricsResponse.builder()
                .totalCollectionsAmount(totalAmount)
                .currentMonthCollectionsAmount(monthAmount)
                .currentYearCollectionsAmount(yearAmount)
                .totalActiveCustomers(totalCustomers)
                .topCustomerCompanyName(topCustomerName)
                .topCustomerTotalAmount(topCustomerAmount)
                .mostUsedPaymentType(mostUsedPaymentType)
                .mostUsedPaymentTypeCount(mostUsedPaymentTypeCount)
                .pendingMaturityAmount(unpaidAmount)
                .dueMaturityCount(collectionRepository
                        .countByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndActiveTrue(
                                CollectionStatus.PENDING,
                                MATURITY_PAYMENT_TYPES,
                                today
                        ))
                .dueMaturityAmount(nullSafe(
                        collectionRepository
                                .sumAmountByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndActiveTrue(
                                        CollectionStatus.PENDING,
                                        MATURITY_PAYMENT_TYPES,
                                        today
                                )
                ))
                .paidAmount(paidAmount)
                .unpaidAmount(unpaidAmount)
                .build();
    }

    @Override
    public DashboardAgingResponse getAging() {
        LocalDate today = LocalDate.now();
        LocalDate upcomingStart = today.plusDays(1);
        LocalDate upcomingEnd = today.plusDays(7);

        return DashboardAgingResponse.builder()
                .overdueCount(collectionRepository
                        .countByStatusAndPaymentTypeInAndMaturityDateBeforeAndActiveTrue(
                                CollectionStatus.PENDING,
                                MATURITY_PAYMENT_TYPES,
                                today
                        ))
                .overdueAmount(nullSafe(
                        collectionRepository
                                .sumAmountByStatusAndPaymentTypeInAndMaturityDateBeforeAndActiveTrue(
                                        CollectionStatus.PENDING,
                                        MATURITY_PAYMENT_TYPES,
                                        today
                                )
                ))
                .dueTodayCount(collectionRepository
                        .countByStatusAndPaymentTypeInAndMaturityDateAndActiveTrue(
                                CollectionStatus.PENDING,
                                MATURITY_PAYMENT_TYPES,
                                today
                        ))
                .dueTodayAmount(nullSafe(
                        collectionRepository
                                .sumAmountByStatusAndPaymentTypeInAndMaturityDateAndActiveTrue(
                                        CollectionStatus.PENDING,
                                        MATURITY_PAYMENT_TYPES,
                                        today
                                )
                ))
                .upcomingCount(collectionRepository
                        .countByStatusAndPaymentTypeInAndMaturityDateBetweenAndActiveTrue(
                                CollectionStatus.PENDING,
                                MATURITY_PAYMENT_TYPES,
                                upcomingStart,
                                upcomingEnd
                        ))
                .upcomingAmount(nullSafe(
                        collectionRepository
                                .sumAmountByStatusAndPaymentTypeInAndMaturityDateBetweenAndActiveTrue(
                                        CollectionStatus.PENDING,
                                        MATURITY_PAYMENT_TYPES,
                                        upcomingStart,
                                        upcomingEnd
                                )
                ))
                .build();
    }

    @Override
    public MonthlyCollectionsResponse getMonthlyCollections(Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();

        List<Object[]> rawRows =
                collectionRepository.sumAmountGroupByMonthAndStatusForYear(targetYear);

        Map<Integer, BigDecimal> paidTotals = new HashMap<>();
        Map<Integer, BigDecimal> unpaidTotals = new HashMap<>();

        for (Object[] row : rawRows) {
            int month = ((Number) row[0]).intValue();
            CollectionStatus status = (CollectionStatus) row[1];
            BigDecimal amount = nullSafe((BigDecimal) row[2]);

            if (status == CollectionStatus.PAID) {
                paidTotals.merge(month, amount, BigDecimal::add);
            } else if (status == CollectionStatus.PENDING) {
                unpaidTotals.merge(month, amount, BigDecimal::add);
            }
        }

        List<MonthlyCollectionItemResponse> months = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            BigDecimal paid = paidTotals.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal unpaid = unpaidTotals.getOrDefault(month, BigDecimal.ZERO);

            months.add(
                    MonthlyCollectionItemResponse.builder()
                            .month(month)
                            .monthName(TURKISH_MONTH_NAMES[month - 1])
                            .paidAmount(paid)
                            .unpaidAmount(unpaid)
                            .totalAmount(paid.add(unpaid))
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
    public TopCustomersResponse getTopCustomers(int limit, Integer year, Integer month) {
        int pageSize = Math.max(1, Math.min(limit, 50));

        List<Object[]> rawRows = collectionRepository.findCustomerAmountByStatusAndOptionalYearAndMonth(
                year,
                month
        );
        Map<UUID, BigDecimal> paidByCustomer = new HashMap<>();
        Map<UUID, BigDecimal> unpaidByCustomer = new HashMap<>();
        Map<UUID, String> names = new LinkedHashMap<>();

        for (Object[] row : rawRows) {
            UUID customerId = (UUID) row[0];
            String companyName = (String) row[1];
            CollectionStatus status = (CollectionStatus) row[2];
            BigDecimal amount = nullSafe((BigDecimal) row[3]);

            names.putIfAbsent(customerId, companyName);

            if (status == CollectionStatus.PAID) {
                paidByCustomer.merge(customerId, amount, BigDecimal::add);
            } else if (status == CollectionStatus.PENDING) {
                unpaidByCustomer.merge(customerId, amount, BigDecimal::add);
            }
        }

        List<TopCustomerItemResponse> customers = names.entrySet().stream()
                .map((entry) -> {
                    BigDecimal paid = paidByCustomer.getOrDefault(entry.getKey(), BigDecimal.ZERO);
                    BigDecimal unpaid = unpaidByCustomer.getOrDefault(entry.getKey(), BigDecimal.ZERO);
                    return TopCustomerItemResponse.builder()
                            .customerId(entry.getKey())
                            .companyName(entry.getValue())
                            .paidAmount(paid)
                            .unpaidAmount(unpaid)
                            .totalAmount(paid.add(unpaid))
                            .build();
                })
                .sorted(Comparator.comparing(TopCustomerItemResponse::getTotalAmount).reversed())
                .limit(pageSize)
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

        Map<PaymentType, BigDecimal> amountByType = new HashMap<>();

        for (Object[] row : collectionRepository.sumAmountGroupByPaymentTypeForMonth(year, month)) {
            amountByType.put((PaymentType) row[0], nullSafe((BigDecimal) row[1]));
        }

        List<PaymentTypeAmountItemResponse> items = new ArrayList<>();

        for (PaymentType paymentType : PaymentType.values()) {
            items.add(
                    PaymentTypeAmountItemResponse.builder()
                            .paymentType(paymentType)
                            .totalAmount(amountByType.getOrDefault(paymentType, BigDecimal.ZERO))
                            .build()
            );
        }

        items.sort(Comparator.comparing(PaymentTypeAmountItemResponse::getTotalAmount).reversed());

        BigDecimal paidAmount = BigDecimal.ZERO;
        BigDecimal unpaidAmount = BigDecimal.ZERO;

        for (Object[] row : collectionRepository.sumAmountGroupByStatusForMonth(year, month)) {
            CollectionStatus status = (CollectionStatus) row[0];
            BigDecimal amount = nullSafe((BigDecimal) row[1]);

            if (status == CollectionStatus.PAID) {
                paidAmount = paidAmount.add(amount);
            } else if (status == CollectionStatus.PENDING) {
                unpaidAmount = unpaidAmount.add(amount);
            }
        }

        List<MailOrderCompanyAmountItemResponse> mailOrderCompanies =
                collectionRepository.sumMailOrderCompaniesForMonth(PaymentType.MAIL_ORDER, year, month)
                        .stream()
                        .map(row -> {
                            String companyName = (String) row[0];
                            return MailOrderCompanyAmountItemResponse.builder()
                                    .companyName(
                                            companyName == null || companyName.isBlank()
                                                    ? "Belirtilmemiş"
                                                    : companyName
                                    )
                                    .totalAmount(nullSafe((BigDecimal) row[1]))
                                    .count(row[2] instanceof Number ? ((Number) row[2]).longValue() : 0L)
                                    .build();
                        })
                        .toList();

        Map<UUID, BigDecimal> paidByCustomer = new HashMap<>();
        Map<UUID, BigDecimal> unpaidByCustomer = new HashMap<>();
        Map<UUID, String> names = new LinkedHashMap<>();

        for (Object[] row : collectionRepository.findCustomerAmountByStatusForMonth(year, month)) {
            UUID customerId = (UUID) row[0];
            names.putIfAbsent(customerId, (String) row[1]);
            BigDecimal amount = nullSafe((BigDecimal) row[3]);
            CollectionStatus status = (CollectionStatus) row[2];

            if (status == CollectionStatus.PAID) {
                paidByCustomer.merge(customerId, amount, BigDecimal::add);
            } else if (status == CollectionStatus.PENDING) {
                unpaidByCustomer.merge(customerId, amount, BigDecimal::add);
            }
        }

        List<TopCustomerItemResponse> customers = names.entrySet().stream()
                .map(entry -> {
                    BigDecimal paid = paidByCustomer.getOrDefault(entry.getKey(), BigDecimal.ZERO);
                    BigDecimal unpaid = unpaidByCustomer.getOrDefault(entry.getKey(), BigDecimal.ZERO);
                    return TopCustomerItemResponse.builder()
                            .customerId(entry.getKey())
                            .companyName(entry.getValue())
                            .paidAmount(paid)
                            .unpaidAmount(unpaid)
                            .totalAmount(paid.add(unpaid))
                            .build();
                })
                .sorted(Comparator.comparing(TopCustomerItemResponse::getTotalAmount).reversed())
                .toList();

        return MonthPaymentBreakdownResponse.builder()
                .year(year)
                .month(month)
                .monthName(TURKISH_MONTH_NAMES[month - 1])
                .totalAmount(paidAmount.add(unpaidAmount))
                .paidAmount(paidAmount)
                .unpaidAmount(unpaidAmount)
                .items(items)
                .mailOrderCompanies(mailOrderCompanies)
                .customers(customers)
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
