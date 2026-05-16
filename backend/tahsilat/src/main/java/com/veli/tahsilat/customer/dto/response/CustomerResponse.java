package com.veli.tahsilat.customer.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

import java.util.UUID;

@Getter
@Builder
public class CustomerResponse {

    private UUID id;

    private String companyName;

    private String authorizedPerson;

    private String phone;

    private String taxNumber;

    private String address;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}