package com.veli.tahsilat.collection.repository;

import com.veli.tahsilat.collection.entity.Collection;

import com.veli.tahsilat.collection.enums.CollectionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.UUID;

public interface CollectionRepository
        extends JpaRepository<Collection, UUID> {

    Page<Collection> findByActiveTrue(Pageable pageable);

    Page<Collection> findByCustomerIdAndActiveTrue(UUID customerId, Pageable pageable);

    Page<Collection> findByStatusAndMaturityDateBeforeAndActiveTrue(
            CollectionStatus status,
            LocalDate maturityDate,
            Pageable pageable
    );


}