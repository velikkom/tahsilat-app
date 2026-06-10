package com.veli.tahsilat.collection.repository;

import com.veli.tahsilat.collection.entity.Collection;

import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CollectionRepository
        extends JpaRepository<Collection, UUID> {

    Optional<Collection> findByIdAndActiveTrue(UUID id);

    Page<Collection> findByActiveTrue(Pageable pageable);

    Page<Collection> findByCustomerIdAndActiveTrue(UUID customerId, Pageable pageable);

    Page<Collection> findByStatusAndMaturityDateBeforeAndActiveTrue(
            CollectionStatus status,
            LocalDate maturityDate,
            Pageable pageable
    );

    List<Collection>findByActiveTrue();

    List<Collection>findByStatusAndActiveTrue(
            CollectionStatus status
    );

    List<Collection>findByPaymentTypeAndActiveTrue(
            PaymentType paymentType
    );


    Page<Collection>findByPaymentTypeAndActiveTrue(
            PaymentType paymentType,
            Pageable pageable
    );

    List<Collection> findByCustomerIdAndActiveTrue(
            UUID customerId
    );

    List<Collection>findByCustomerIdAndPaymentTypeAndActiveTrue(
            UUID customerId,
            PaymentType paymentType
    );

    List<Collection> findByCollectionDateBetweenAndActiveTrue(
            LocalDate startDate,
            LocalDate endDate
    );

    Page<Collection> findByActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            """)
    BigDecimal sumAmountByActiveTrue();

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.status = :status
            """)
    BigDecimal sumAmountByStatusAndActiveTrue(
            @Param("status") CollectionStatus status
    );

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.paymentType = :paymentType
            """)
    BigDecimal sumAmountByPaymentTypeAndActiveTrue(
            @Param("paymentType") PaymentType paymentType
    );

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.customer.id = :customerId
            """)
    BigDecimal sumAmountByCustomerIdAndActiveTrue(
            @Param("customerId") UUID customerId
    );

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.customer.id = :customerId
            AND c.paymentType = :paymentType
            """)
    BigDecimal sumAmountByCustomerIdAndPaymentTypeAndActiveTrue(
            @Param("customerId") UUID customerId,
            @Param("paymentType") PaymentType paymentType
    );

    long countByCustomerIdAndActiveTrue(UUID customerId);

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.collectionDate BETWEEN :startDate AND :endDate
            """)
    BigDecimal sumAmountByActiveTrueAndCollectionDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            SELECT c.paymentType, COUNT(c), COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            GROUP BY c.paymentType
            ORDER BY COUNT(c) DESC
            """)
    List<Object[]> findPaymentTypeDistributionRaw();

    @Query("""
            SELECT c.customer.id, c.customer.companyName, COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            GROUP BY c.customer.id, c.customer.companyName
            ORDER BY SUM(c.amount) DESC
            """)
    List<Object[]> findTopCustomersByAmount(Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND (:year IS NULL OR EXTRACT(YEAR FROM c.collectionDate) = :year)
            """)
    BigDecimal sumAmountByActiveTrueAndOptionalYear(@Param("year") Integer year);

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.collectionDate BETWEEN :startDate AND :endDate
            AND (:year IS NULL OR EXTRACT(YEAR FROM c.collectionDate) = :year)
            """)
    BigDecimal sumAmountByActiveTrueAndCollectionDateBetweenAndOptionalYear(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("year") Integer year
    );

    @Query("""
            SELECT c.paymentType, COUNT(c), COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND (:year IS NULL OR EXTRACT(YEAR FROM c.collectionDate) = :year)
            GROUP BY c.paymentType
            ORDER BY COUNT(c) DESC
            """)
    List<Object[]> findPaymentTypeDistributionRawByOptionalYear(@Param("year") Integer year);

    @Query("""
            SELECT c.customer.id, c.customer.companyName, COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND (:year IS NULL OR EXTRACT(YEAR FROM c.collectionDate) = :year)
            GROUP BY c.customer.id, c.customer.companyName
            ORDER BY SUM(c.amount) DESC
            """)
    List<Object[]> findTopCustomersByAmountAndOptionalYear(
            @Param("year") Integer year,
            Pageable pageable
    );

    @Query("""
            SELECT c
            FROM Collection c
            WHERE c.active = true
            AND (:year IS NULL OR EXTRACT(YEAR FROM c.collectionDate) = :year)
            ORDER BY c.createdAt DESC
            """)
    Page<Collection> findByActiveTrueAndOptionalYearOrderByCreatedAtDesc(
            @Param("year") Integer year,
            Pageable pageable
    );

    @Query("""
            SELECT c.paymentType, COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND EXTRACT(YEAR FROM c.collectionDate) = :year
            AND EXTRACT(MONTH FROM c.collectionDate) = :month
            GROUP BY c.paymentType
            ORDER BY SUM(c.amount) DESC
            """)
    List<Object[]> sumAmountGroupByPaymentTypeForMonth(
            @Param("year") int year,
            @Param("month") int month
    );

    @Query("""
            SELECT c.customer.id, c.customer.companyName, COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.paymentType = :paymentType
            AND (:year IS NULL OR EXTRACT(YEAR FROM c.collectionDate) = :year)
            GROUP BY c.customer.id, c.customer.companyName
            ORDER BY SUM(c.amount) DESC
            """)
    List<Object[]> findTopCustomersByPaymentTypeAndOptionalYear(
            @Param("paymentType") PaymentType paymentType,
            @Param("year") Integer year,
            Pageable pageable
    );

    @Query("""
            SELECT EXTRACT(MONTH FROM c.collectionDate), COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND EXTRACT(YEAR FROM c.collectionDate) = :year
            GROUP BY EXTRACT(MONTH FROM c.collectionDate)
            ORDER BY EXTRACT(MONTH FROM c.collectionDate)
            """)
    List<Object[]> sumAmountGroupByMonthForYear(@Param("year") int year);

    @Query("""
            SELECT c.customer.id, c.amount, c.collectionDate, c.paymentType, c.maturityDate
            FROM Collection c
            WHERE c.active = true
            """)
    List<Object[]> findActiveCollectionDuplicateKeys();

    @Query("""
            SELECT COUNT(c) > 0
            FROM Collection c
            WHERE c.active = true
            AND c.customer.id = :customerId
            AND c.amount = :amount
            AND c.collectionDate = :collectionDate
            AND c.paymentType = :paymentType
            AND (
                (:maturityDate IS NULL AND c.maturityDate IS NULL)
                OR (:maturityDate IS NOT NULL AND c.maturityDate = :maturityDate)
            )
            AND (:excludeId IS NULL OR c.id <> :excludeId)
            """)
    boolean existsActiveDuplicate(
            @Param("customerId") UUID customerId,
            @Param("amount") BigDecimal amount,
            @Param("collectionDate") LocalDate collectionDate,
            @Param("paymentType") PaymentType paymentType,
            @Param("maturityDate") LocalDate maturityDate,
            @Param("excludeId") UUID excludeId
    );

}