package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class TopCustomerItemResponse {

    private UUID customerId;

    private String companyName;

    private BigDecimal totalAmount;
}
