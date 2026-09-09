package com.veli.tahsilat.trip.repository;

import com.veli.tahsilat.trip.entity.Trip;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TripRepository
        extends JpaRepository<Trip, UUID> {

    Optional<Trip> findByIdAndActiveTrue(UUID id);

    Page<Trip> findByActiveTrue(Pageable pageable);

    Page<Trip> findBySalesmanIdAndActiveTrue(UUID salesmanId, Pageable pageable);
}
