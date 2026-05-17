package com.veli.tahsilat.customer.service;

import com.veli.tahsilat.customer.dto.request.CreateCustomerRequest;
import com.veli.tahsilat.customer.dto.request.UpdateCustomerRequest;
import com.veli.tahsilat.customer.dto.response.CustomerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CustomerService {

    CustomerResponse createCustomer(
            CreateCustomerRequest request
    );

    Page<CustomerResponse> getAllActiveCustomers(
            Pageable pageable
    );

    Page<CustomerResponse> getAllCustomers(
            Pageable pageable
    );

    CustomerResponse getCustomerById(
            UUID id
    );

    CustomerResponse updateCustomer(
            UUID id,
            UpdateCustomerRequest request
    );

    void deleteCustomer(
            UUID id
    );

    Page<CustomerResponse> searchCustomers(
            String keyword,
            Pageable pageable
    );
}