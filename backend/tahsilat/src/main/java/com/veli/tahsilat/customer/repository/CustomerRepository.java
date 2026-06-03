package com.veli.tahsilat.customer.repository;

import com.veli.tahsilat.customer.entity.Customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository
        extends JpaRepository<Customer, UUID>
{

    Page<Customer> findByActiveTrue(Pageable pageable);

    long countByActiveTrue();

    Optional<Customer> findByIdAndActiveTrue(UUID id);

    boolean existsByTaxNumber(String taxNumber);

    Page<Customer>
    findByActiveTrueAndCompanyNameContainingIgnoreCaseOrActiveTrueAndAuthorizedPersonContainingIgnoreCaseOrActiveTrueAndPhoneContainingIgnoreCaseOrActiveTrueAndTaxNumberContainingIgnoreCase(
            String companyName,
            String authorizedPerson,
            String phone,
            String taxNumber,
            Pageable pageable
    );


}