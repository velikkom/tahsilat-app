package com.veli.tahsilat.customer.controller;

import com.veli.tahsilat.customer.dto.request.CreateCustomerRequest;
import com.veli.tahsilat.customer.dto.request.UpdateCustomerRequest;
import com.veli.tahsilat.customer.dto.response.CustomerResponse;
import com.veli.tahsilat.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
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

    @Operation(
            summary = "Create a new customer",
            description = "Create a new customer"
    )
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

    @Operation(
            summary = "Get all customers",
            description = "Get all customers"
    )
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

    @Operation(
            summary = "Get a customer by ID",
            description = "Get a customer by ID"
    )
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


    @Operation(
            summary = "Update a customer by ID",
            description = "Update a customer by ID"
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<CustomerResponse>updateCustomer(
            @PathVariable UUID id,
            @Valid
            @RequestBody UpdateCustomerRequest request
    )
    {
       return ResponseEntity.ok(
                customerService.updateCustomer(id, request)
        );
    }

    @Operation(
            summary = "Get all active customers",
            description = "Get all active customers"
    )
    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')")
    public ResponseEntity<Page<CustomerResponse>> getActiveCustomers(
            Pageable pageable
    )
    {
        return ResponseEntity.ok(
                customerService.getAllActiveCustomers(pageable)
        );

    }

    @Operation(
            summary = "Delete customer",
            description = "Soft delete customer"
    )
    @DeleteMapping("/{id}")
    @PreAuthorize(
            "hasAuthority('ROLE_ADMIN')"
    )

    public ResponseEntity<Void>
    deleteCustomer(

            @PathVariable UUID id
    ) {

        customerService.deleteCustomer(id);

        return ResponseEntity.noContent()
                .build();
    }

    @Operation(
            summary = "Search customers",
            description = "Search customers by keyword"
    )
    @GetMapping("/search")
    @PreAuthorize(
            "hasAnyAuthority('ROLE_ADMIN','ROLE_SALESMAN')"
    )
    public ResponseEntity<Page<CustomerResponse>>
    searchCustomers(

            @RequestParam String keyword,

            Pageable pageable
    ) {

        return ResponseEntity.ok(

                customerService.searchCustomers(
                        keyword,
                        pageable
                )
        );
    }

}