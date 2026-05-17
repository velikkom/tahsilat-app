package com.veli.tahsilat.customer.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCustomerRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Authorized person is required")
    private String authorizedPerson;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String taxNumber;

    private String address;
}