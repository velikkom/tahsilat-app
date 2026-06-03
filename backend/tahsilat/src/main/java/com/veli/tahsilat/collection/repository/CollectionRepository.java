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
            SELECT FUNCTION('MONTH', c.collectionDate), COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND FUNCTION('YEAR', c.collectionDate) = :year
            GROUP BY FUNCTION('MONTH', c.collectionDate)
            ORDER BY FUNCTION('MONTH', c.collectionDate)
            """)
    List<Object[]> sumAmountGroupByMonthForYear(@Param("year") int year);

}