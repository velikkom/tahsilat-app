package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class MailOrderCompanyAmountItemResponse {

    private String companyName;

    private BigDecimal totalAmount;

    private Long count;

    private List<MailOrderCompanyAmountItemResponse> customers;
}
