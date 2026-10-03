package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PayingCustomerCountResponse {

    /** Distinct customers with a paid collection in the year, or across all years when year is null. */
    private Long count;

    private Integer year;

    /** Empty when year is null. */
    private List<PayingCustomerMonthResponse> months;
}
