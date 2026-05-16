package com.veli.tahsilat.customer.controller;

import com.veli.tahsilat.customer.dto.request.CreateCustomerRequest;

import com.veli.tahsilat.customer.dto.response.CustomerResponse;

import com.veli.tahsilat.customer.service.CustomerService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize(
            "hasAnyAuthority('ROLE_ADMIN')"
    )
    public ResponseEntity<CustomerResponse> createCustomer(
            @Valid
            @RequestBody CreateCustomerRequest request
    )
    {

        return ResponseEntity

                .status(HttpStatus.CREATED)

                .body(

                        customerService.createCustomer(
                                request
                        )
                );
    }


    @GetMapping
    @PreAuthorize(
            "hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')"
    )
    public ResponseEntity<Page<CustomerResponse>> getAllCustomers(Pageable pageable)
    {
        return ResponseEntity.ok(
                customerService.getAllCustomers(pageable)
        );
    }


    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')"
    )
    public ResponseEntity<CustomerResponse> getCustomerById(
            @PathVariable UUID id
    )
    {
        return ResponseEntity.ok(
                customerService.getCustomerById(id)
        );
    }

}