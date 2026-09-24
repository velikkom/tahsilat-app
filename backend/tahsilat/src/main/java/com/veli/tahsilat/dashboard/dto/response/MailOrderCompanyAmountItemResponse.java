package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class MailOrderCompanyAmountItemResponse {

    private UUID customerId;

    private String companyName;

    private BigDecimal totalAmount;

    private Long count;

    private List<MailOrderCompanyAmountItemResponse> customers;
}
