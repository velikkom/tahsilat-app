package com.veli.tahsilat.collection.importexcel.support;

import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CustomerNameMatcher {

    private final CustomerRepository customerRepository;
    private final CollectionExcelParseSupport parseSupport;

    public Optional<Customer> match(String customerName) {
        if (customerName == null || customerName.isBlank()) {
            return Optional.empty();
        }

        List<Customer> customers = customerRepository.findByActiveTrue();
        String excelName = parseSupport.normalize(customerName);
        String excelNormalized = excelName.replace(" ", "");

        return customers.stream()
                .filter(customer -> {
                    String dbName = parseSupport.normalize(customer.getCompanyName());
                    String dbNormalized = dbName.replace(" ", "");

                    return dbNormalized.contains(excelNormalized)
                            || excelNormalized.contains(dbNormalized);
                })
                .findFirst();
    }
}
