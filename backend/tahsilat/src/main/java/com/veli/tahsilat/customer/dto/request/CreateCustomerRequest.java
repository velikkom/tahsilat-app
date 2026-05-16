package com.veli.tahsilat.customer.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCustomerRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String authorizedPerson;

    private String phone;

    private String taxNumber;

    private String address;
}