package com.veli.tahsilat.customer.service.impl;

import com.veli.tahsilat.customer.dto.request.CreateCustomerRequest;

import com.veli.tahsilat.customer.dto.response.CustomerResponse;

import com.veli.tahsilat.customer.entity.Customer;

import com.veli.tahsilat.customer.mapper.CustomerMapper;

import com.veli.tahsilat.customer.repository.CustomerRepository;

import com.veli.tahsilat.customer.service.CustomerService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl
        implements CustomerService {

    private final CustomerRepository customerRepository;

    private final CustomerMapper customerMapper;

    @Override
    public CustomerResponse createCustomer(
            CreateCustomerRequest request
    ) {

        Customer customer =
                customerMapper.toEntity(request);

        Customer savedCustomer =
                customerRepository.save(customer);

        return customerMapper.toResponse(
                savedCustomer
        );
    }

    @Override
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        return customerRepository
                .findAll(pageable)
                .map(customerMapper::toResponse);
    }

    @Override
    public CustomerResponse getCustomerById(UUID id) {

      Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return customerMapper.toResponse(customer);
    }
}