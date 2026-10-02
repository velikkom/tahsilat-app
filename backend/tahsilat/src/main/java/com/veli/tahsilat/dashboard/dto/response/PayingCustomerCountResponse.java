package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PayingCustomerCountResponse {

    private Long count;

    private Integer year;

    private Integer month;
}
