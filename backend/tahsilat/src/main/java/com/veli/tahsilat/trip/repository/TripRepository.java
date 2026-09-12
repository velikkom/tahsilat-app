package com.veli.tahsilat.trip.repository;

import com.veli.tahsilat.trip.entity.Trip;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface TripRepository
        extends JpaRepository<Trip, UUID> {

    Optional<Trip> findByIdAndActiveTrue(UUID id);

    /**
     * fromDate/toDate are both optional. When both are given, trips whose
     * own [startDate, endDate] range overlaps the filter range are matched.
     * When only one side is given, it constrains only that side of the
     * trip's range (see Sprint F6 report for the exact rule).
     */
    @Query("""
            SELECT t
            FROM Trip t
            WHERE t.active = true
            AND (
                (:fromDate IS NOT NULL AND :toDate IS NOT NULL AND t.startDate <= :toDate AND t.endDate >= :fromDate)
                OR (:fromDate IS NOT NULL AND :toDate IS NULL AND t.startDate >= :fromDate)
                OR (:fromDate IS NULL AND :toDate IS NOT NULL AND t.endDate <= :toDate)
                OR (:fromDate IS NULL AND :toDate IS NULL)
            )
            """)
    Page<Trip> findByActiveTrueAndDateRangeOverlap(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );

    @Query("""
            SELECT t
            FROM Trip t
            WHERE t.active = true
            AND t.salesman.id = :salesmanId
            AND (
                (:fromDate IS NOT NULL AND :toDate IS NOT NULL AND t.startDate <= :toDate AND t.endDate >= :fromDate)
                OR (:fromDate IS NOT NULL AND :toDate IS NULL AND t.startDate >= :fromDate)
                OR (:fromDate IS NULL AND :toDate IS NOT NULL AND t.endDate <= :toDate)
                OR (:fromDate IS NULL AND :toDate IS NULL)
            )
            """)
    Page<Trip> findBySalesmanIdAndActiveTrueAndDateRangeOverlap(
            @Param("salesmanId") UUID salesmanId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );
}
