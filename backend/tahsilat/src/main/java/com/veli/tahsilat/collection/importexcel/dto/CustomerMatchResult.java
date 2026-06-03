package com.veli.tahsilat.collection.importexcel.dto;

import com.veli.tahsilat.customer.entity.Customer;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CustomerMatchResult {

    private boolean matched;

    private Customer customer;

    private String normalizedCustomerName;

    public static CustomerMatchResult matched(
            Customer customer,
            String normalizedCustomerName
    ) {
        return CustomerMatchResult.builder()
                .matched(true)
                .customer(customer)
                .normalizedCustomerName(normalizedCustomerName)
                .build();
    }

    public static CustomerMatchResult notFound(String normalizedCustomerName) {
        return CustomerMatchResult.builder()
                .matched(false)
                .normalizedCustomerName(normalizedCustomerName)
                .build();
    }
}
