package com.veli.tahsilat.collection.repository;

import com.veli.tahsilat.collection.entity.Collection;

import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
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

}