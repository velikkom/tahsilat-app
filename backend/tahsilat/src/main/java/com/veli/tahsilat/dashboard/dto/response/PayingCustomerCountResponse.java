package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PayingCustomerCountResponse {

    /** Distinct customers with a paid or pending collection in the period. */
    private Long count;

    /** Distinct customers with at least one paid collection in the period. */
    private Long paidCount;

    private Integer year;

    private Integer month;
}
