package com.veli.tahsilat.dashboard.dto.response;

import com.veli.tahsilat.collection.enums.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PaymentTypeCustomersResponse {

    private PaymentType paymentType;

    private Integer year;

    private List<TopCustomerItemResponse> customers;
}
