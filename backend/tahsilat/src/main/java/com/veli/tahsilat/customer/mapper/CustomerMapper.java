package com.veli.tahsilat.customer.mapper;

import com.veli.tahsilat.customer.dto.request.CreateCustomerRequest;
import com.veli.tahsilat.customer.dto.request.UpdateCustomerRequest;
import com.veli.tahsilat.customer.dto.response.CustomerResponse;
import com.veli.tahsilat.customer.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    Customer toEntity(
            CreateCustomerRequest request
    );

    CustomerResponse toResponse(
            Customer customer
    );

    void updateCustomerFromRequest(

            UpdateCustomerRequest request,

            @MappingTarget Customer customer
    );
}