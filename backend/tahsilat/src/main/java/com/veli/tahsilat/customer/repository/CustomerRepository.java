package com.veli.tahsilat.customer.repository;

import com.veli.tahsilat.customer.entity.Customer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CustomerRepository
        extends JpaRepository<Customer, UUID> {
}