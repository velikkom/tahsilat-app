package com.veli.tahsilat.customer.repository;

import com.veli.tahsilat.customer.entity.Customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository
        extends JpaRepository<Customer, UUID>
{

    Page<Customer> findByActiveTrue(Pageable pageable);

    List<Customer> findByActiveTrue();

    long countByActiveTrue();

    Optional<Customer> findByIdAndActiveTrue(UUID id);

    boolean existsByTaxNumber(String taxNumber);

    boolean existsByActiveTrueAndTaxNumber(String taxNumber);

    boolean existsByActiveTrueAndTaxNumberAndIdNot(
            String taxNumber,
            UUID id
    );

    @Query("""
            SELECT c
            FROM Customer c
            WHERE c.active = true
            AND (c.taxNumber IS NULL OR TRIM(c.taxNumber) = '')
            """)
    List<Customer> findActiveCustomersWithoutTaxNumber();

    Page<Customer>
    findByActiveTrueAndCompanyNameContainingIgnoreCaseOrActiveTrueAndAuthorizedPersonContainingIgnoreCaseOrActiveTrueAndPhoneContainingIgnoreCaseOrActiveTrueAndTaxNumberContainingIgnoreCase(
            String companyName,
            String authorizedPerson,
            String phone,
            String taxNumber,
            Pageable pageable
    );


}