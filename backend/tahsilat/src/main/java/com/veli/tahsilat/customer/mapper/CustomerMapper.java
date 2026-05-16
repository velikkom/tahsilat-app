package com.veli.tahsilat.customer.mapper;

import com.veli.tahsilat.customer.dto.request.CreateCustomerRequest;
import com.veli.tahsilat.customer.dto.response.CustomerResponse;
import com.veli.tahsilat.customer.entity.Customer;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "id", ignore = true)

    @Mapping(target = "active", constant = "true")

    @Mapping(
            target = "createdAt",
            expression = "java(java.time.LocalDateTime.now())"
    )

    @Mapping(
            target = "updatedAt",
            expression = "java(java.time.LocalDateTime.now())"
    )

    Customer toEntity(
            CreateCustomerRequest request
    );

    CustomerResponse toResponse(
            Customer customer
    );
}