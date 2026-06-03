package com.veli.tahsilat.collection.importexcel.support;

import com.veli.tahsilat.collection.importexcel.dto.CustomerMatchResult;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CustomerNameMatcher {

    private final CustomerRepository customerRepository;
    private final CustomerNameNormalizer customerNameNormalizer;

    public Map<String, Customer> buildCustomerIndex() {
        List<Customer> customers = customerRepository.findByActiveTrue();
        Map<String, Customer> index = new HashMap<>();

        for (Customer customer : customers) {
            String normalizedName = customerNameNormalizer.normalizeCustomerName(
                    customer.getCompanyName()
            );

            if (normalizedName.isBlank()) {
                continue;
            }

            index.putIfAbsent(normalizedName, customer);
        }

        return index;
    }

    public CustomerMatchResult match(
            String customerName,
            Map<String, Customer> customerIndex
    ) {
        if (customerName == null || customerName.isBlank()) {
            return CustomerMatchResult.notFound("");
        }

        String normalizedName = customerNameNormalizer.normalizeCustomerName(
                customerName
        );

        if (normalizedName.isBlank()) {
            return CustomerMatchResult.notFound("");
        }

        Customer customer = customerIndex.get(normalizedName);

        if (customer == null) {
            return CustomerMatchResult.notFound(normalizedName);
        }

        return CustomerMatchResult.matched(customer, normalizedName);
    }
}
