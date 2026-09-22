package com.veli.tahsilat.collection.repository;

import com.veli.tahsilat.collection.entity.Collection;

import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    Page<Collection> findByCollectedByIdAndActiveTrue(UUID collectedById, Pageable pageable);

    long countByCollectedByIsNull();

    Page<Collection> findByCustomerIdAndActiveTrue(UUID customerId, Pageable pageable);

    Page<Collection> findByCustomerIdAndCollectedByIdAndActiveTrue(
            UUID customerId,
            UUID collectedById,
            Pageable pageable
    );

    Page<Collection> findByStatusAndMaturityDateBeforeAndActiveTrue(
            CollectionStatus status,
            LocalDate maturityDate,
            Pageable pageable
    );

    Page<Collection> findByStatusAndMaturityDateBeforeAndCollectedByIdAndActiveTrue(
            CollectionStatus status,
            LocalDate maturityDate,
            UUID collectedById,
            Pageable pageable
    );

    Page<Collection> findByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndActiveTrue(
            CollectionStatus status,
            List<PaymentType> paymentTypes,
            LocalDate maturityDate,
            Pageable pageable
    );

    Page<Collection> findByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndCollectedByIdAndActiveTrue(
            CollectionStatus status,
            List<PaymentType> paymentTypes,
            LocalDate maturityDate,
            UUID collectedById,
            Pageable pageable
    );

    long countByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndActiveTrue(
            CollectionStatus status,
            List<PaymentType> paymentTypes,
            LocalDate maturityDate
    );

    long countByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndCollectedByIdAndActiveTrue(
            CollectionStatus status,
            List<PaymentType> paymentTypes,
            LocalDate maturityDate,
            UUID collectedById
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
            AND c.status = :status
            AND c.paymentType IN :paymentTypes
            """)
    BigDecimal sumAmountByStatusAndPaymentTypeInAndActiveTrue(
            @Param("status") CollectionStatus status,
            @Param("paymentTypes") List<PaymentType> paymentTypes
    );

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.status = :status
            AND c.paymentType IN :paymentTypes
            AND c.collectedBy.id = :collectedById
            """)
    BigDecimal sumAmountByStatusAndPaymentTypeInAndCollectedByIdAndActiveTrue(
            @Param("status") CollectionStatus status,
            @Param("paymentTypes") List<PaymentType> paymentTypes,
            @Param("collectedById") UUID collectedById
    );

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.status = :status
            AND c.paymentType IN :paymentTypes
            AND c.maturityDate <= :maturityDate
            """)
    BigDecimal sumAmountByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndActiveTrue(
            @Param("status") CollectionStatus status,
            @Param("paymentTypes") List<PaymentType> paymentTypes,
            @Param("maturityDate") LocalDate maturityDate
    );

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.status = :status
            AND c.paymentType IN :paymentTypes
            AND c.maturityDate <= :maturityDate
            AND c.collectedBy.id = :collectedById
            """)
    BigDecimal sumAmountByStatusAndPaymentTypeInAndMaturityDateLessThanEqualAndCollectedByIdAndActiveTrue(
            @Param("status") CollectionStatus status,
            @Param("paymentTypes") List<PaymentType> paymentTypes,
            @Param("maturityDate") LocalDate maturityDate,
            @Param("collectedById") UUID collectedById
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
            SELECT c.customer.id, c.customer.companyName, c.status, COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND (:year IS NULL OR EXTRACT(YEAR FROM c.collectionDate) = :year)
            AND (:month IS NULL OR EXTRACT(MONTH FROM c.collectionDate) = :month)
            GROUP BY c.customer.id, c.customer.companyName, c.status
            """)
    List<Object[]> findCustomerAmountByStatusAndOptionalYearAndMonth(
            @Param("year") Integer year,
            @Param("month") Integer month
    );

    @Query("""
            SELECT EXTRACT(MONTH FROM c.collectionDate), c.status, COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND EXTRACT(YEAR FROM c.collectionDate) = :year
            GROUP BY EXTRACT(MONTH FROM c.collectionDate), c.status
            """)
    List<Object[]> sumAmountGroupByMonthAndStatusForYear(@Param("year") int year);

    long countByStatusAndPaymentTypeInAndMaturityDateAndActiveTrue(
            CollectionStatus status,
            List<PaymentType> paymentTypes,
            LocalDate maturityDate
    );

    long countByStatusAndPaymentTypeInAndMaturityDateBeforeAndActiveTrue(
            CollectionStatus status,
            List<PaymentType> paymentTypes,
            LocalDate maturityDate
    );

    long countByStatusAndPaymentTypeInAndMaturityDateBetweenAndActiveTrue(
            CollectionStatus status,
            List<PaymentType> paymentTypes,
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.status = :status
            AND c.paymentType IN :paymentTypes
            AND c.maturityDate = :maturityDate
            """)
    BigDecimal sumAmountByStatusAndPaymentTypeInAndMaturityDateAndActiveTrue(
            @Param("status") CollectionStatus status,
            @Param("paymentTypes") List<PaymentType> paymentTypes,
            @Param("maturityDate") LocalDate maturityDate
    );

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.status = :status
            AND c.paymentType IN :paymentTypes
            AND c.maturityDate < :maturityDate
            """)
    BigDecimal sumAmountByStatusAndPaymentTypeInAndMaturityDateBeforeAndActiveTrue(
            @Param("status") CollectionStatus status,
            @Param("paymentTypes") List<PaymentType> paymentTypes,
            @Param("maturityDate") LocalDate maturityDate
    );

    @Query("""
            SELECT COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.status = :status
            AND c.paymentType IN :paymentTypes
            AND c.maturityDate BETWEEN :startDate AND :endDate
            """)
    BigDecimal sumAmountByStatusAndPaymentTypeInAndMaturityDateBetweenAndActiveTrue(
            @Param("status") CollectionStatus status,
            @Param("paymentTypes") List<PaymentType> paymentTypes,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
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
            SELECT c.status, COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND EXTRACT(YEAR FROM c.collectionDate) = :year
            AND EXTRACT(MONTH FROM c.collectionDate) = :month
            GROUP BY c.status
            """)
    List<Object[]> sumAmountGroupByStatusForMonth(
            @Param("year") int year,
            @Param("month") int month
    );

    @Query("""
            SELECT COALESCE(c.mailOrderCompany, ''), COALESCE(SUM(c.amount), 0), COUNT(c)
            FROM Collection c
            WHERE c.active = true
            AND c.paymentType = :paymentType
            AND EXTRACT(YEAR FROM c.collectionDate) = :year
            AND EXTRACT(MONTH FROM c.collectionDate) = :month
            GROUP BY c.mailOrderCompany
            ORDER BY SUM(c.amount) DESC
            """)
    List<Object[]> sumMailOrderCompaniesForMonth(
            @Param("paymentType") PaymentType paymentType,
            @Param("year") int year,
            @Param("month") int month
    );

    @Query("""
            SELECT c.customer.id, c.customer.companyName, c.status, COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND EXTRACT(YEAR FROM c.collectionDate) = :year
            AND EXTRACT(MONTH FROM c.collectionDate) = :month
            GROUP BY c.customer.id, c.customer.companyName, c.status
            """)
    List<Object[]> findCustomerAmountByStatusForMonth(
            @Param("year") int year,
            @Param("month") int month
    );

    @Query("""
            SELECT c.paymentType, c.customer.companyName, COALESCE(SUM(c.amount), 0), COUNT(c)
            FROM Collection c
            WHERE c.active = true
            AND EXTRACT(YEAR FROM c.collectionDate) = :year
            AND EXTRACT(MONTH FROM c.collectionDate) = :month
            GROUP BY c.paymentType, c.customer.companyName
            ORDER BY SUM(c.amount) DESC
            """)
    List<Object[]> sumCustomersByPaymentTypeForMonth(
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

    /*
     * Duplicate kontrolu icin null durumlarina gore ayri turetilmis sorgular
     * kullanilir. JPQL'de ":param IS NULL" kalibi PostgreSQL'de
     * "could not determine data type of parameter" hatasina yol actigi icin
     * null dallanmasi Java tarafinda (CollectionDuplicateValidator) yapilir.
     */

    boolean existsByCustomerIdAndAmountAndCollectionDateAndPaymentTypeAndMaturityDateAndActiveTrue(
            UUID customerId,
            BigDecimal amount,
            LocalDate collectionDate,
            PaymentType paymentType,
            LocalDate maturityDate
    );

    boolean existsByCustomerIdAndAmountAndCollectionDateAndPaymentTypeAndMaturityDateIsNullAndActiveTrue(
            UUID customerId,
            BigDecimal amount,
            LocalDate collectionDate,
            PaymentType paymentType
    );

    boolean existsByCustomerIdAndAmountAndCollectionDateAndPaymentTypeAndMaturityDateAndActiveTrueAndIdNot(
            UUID customerId,
            BigDecimal amount,
            LocalDate collectionDate,
            PaymentType paymentType,
            LocalDate maturityDate,
            UUID excludeId
    );

    boolean existsByCustomerIdAndAmountAndCollectionDateAndPaymentTypeAndMaturityDateIsNullAndActiveTrueAndIdNot(
            UUID customerId,
            BigDecimal amount,
            LocalDate collectionDate,
            PaymentType paymentType,
            UUID excludeId
    );

    @Query("""
            SELECT c.paymentType, COALESCE(SUM(c.amount), 0)
            FROM Collection c
            WHERE c.active = true
            AND c.collectedBy.id = :collectedById
            AND c.collectionDate BETWEEN :startDate AND :endDate
            GROUP BY c.paymentType
            """)
    List<Object[]> sumAmountGroupByPaymentTypeForCollectedByAndDateRange(
            @Param("collectedById") UUID collectedById,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<Collection> findByCollectedByIdAndCollectionDateBetweenAndActiveTrueOrderByCollectionDateAsc(
            UUID collectedById,
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("""
            SELECT c FROM Collection c
            JOIN FETCH c.customer
            WHERE c.collectedBy.id = :collectedById
            AND c.collectionDate BETWEEN :startDate AND :endDate
            AND c.active = true
            AND c.customer.active = true
            ORDER BY c.collectionDate ASC, c.id ASC
            """)
    List<Collection> findDocumentCollections(
            @Param("collectedById") UUID collectedById,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Collection c
            SET c.active = false
            WHERE c.customer.id = :customerId
            AND c.active = true
            """)
    int deactivateActiveByCustomerId(@Param("customerId") UUID customerId);

    @Query("""
            SELECT DISTINCT c.mailOrderCompany
            FROM Collection c
            WHERE c.active = true
            AND c.mailOrderCompany IS NOT NULL
            AND c.mailOrderCompany <> ''
            """)
    List<String> findDistinctMailOrderCompanies();
}