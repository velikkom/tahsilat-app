package com.veli.tahsilat.customer.service.impl;

import com.veli.tahsilat.common.exception.ResourceNotFoundException;
import com.veli.tahsilat.customer.dto.request.CreateCustomerRequest;

import com.veli.tahsilat.customer.dto.request.UpdateCustomerRequest;
import com.veli.tahsilat.customer.dto.response.CustomerResponse;

import com.veli.tahsilat.customer.entity.Customer;

import com.veli.tahsilat.customer.mapper.CustomerMapper;

import com.veli.tahsilat.customer.repository.CustomerRepository;

import com.veli.tahsilat.customer.service.CustomerService;
import com.veli.tahsilat.customer.validation.CustomerDuplicateValidator;

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

    private final CustomerDuplicateValidator customerDuplicateValidator;

    @Override
    public CustomerResponse createCustomer(
            CreateCustomerRequest request
    ) {
        customerDuplicateValidator.assertNotDuplicateForCreate(
                request.getTaxNumber(),
                request.getCompanyName()
        );

        Customer customer =
                customerMapper.toEntity(request);

        Customer savedCustomer =
                customerRepository.save(customer);

        return customerMapper.toResponse(
                savedCustomer
        );
    }

    @Override
    public Page<CustomerResponse> getAllActiveCustomers(Pageable pageable) {

        return customerRepository.findByActiveTrue(pageable)
                .map(customerMapper::toResponse);
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
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found"
                ));
        return customerMapper.toResponse(customer);
    }

    @Override
    public CustomerResponse updateCustomer(UUID id, UpdateCustomerRequest request) {

        Customer customer = customerRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found")
                );

        customerDuplicateValidator.assertNotDuplicateForUpdate(
                request.getTaxNumber(),
                request.getCompanyName(),
                id
        );

        customerMapper.updateCustomerFromRequest(request, customer);

        Customer updateCustomer = customerRepository.save(customer);

        return customerMapper.toResponse(updateCustomer);
    }

    @Override
    public void deleteCustomer(UUID id) {

        Customer customer =
                customerRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found"
                ));

        customer.setActive(false);

        customerRepository.save(customer);
    }

    @Override
    public Page<CustomerResponse> searchCustomers(
            String keyword,
            Pageable pageable
    ) {

        return customerRepository.findByActiveTrueAndCompanyNameContainingIgnoreCaseOrActiveTrueAndAuthorizedPersonContainingIgnoreCaseOrActiveTrueAndPhoneContainingIgnoreCaseOrActiveTrueAndTaxNumberContainingIgnoreCase(
                keyword,
                keyword,
                keyword,
                keyword,
                pageable
                )
                .map(customerMapper::toResponse);
    }

}