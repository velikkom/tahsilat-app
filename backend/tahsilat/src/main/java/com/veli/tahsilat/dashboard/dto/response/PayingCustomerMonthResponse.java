package com.veli.tahsilat.dashboard.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PayingCustomerMonthResponse {

    private Integer month;

    /** Distinct customers with a paid collection in this month. */
    private Long count;

    /** Distinct customers with a paid collection from January through this month. */
    private Long cumulativeCount;

    /** Customers whose first paid collection of the year falls in this month. */
    private Long newCount;
}
