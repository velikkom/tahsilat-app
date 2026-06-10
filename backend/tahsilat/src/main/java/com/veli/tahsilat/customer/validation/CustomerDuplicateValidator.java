package com.veli.tahsilat.customer.validation;

import com.veli.tahsilat.collection.importexcel.support.CustomerNameNormalizer;
import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomerDuplicateValidator {

    public static final String TAX_NUMBER_DUPLICATE_MESSAGE =
            "Bu vergi numarasına sahip müşteri zaten mevcut.";

    public static final String COMPANY_NAME_DUPLICATE_MESSAGE =
            "Bu firma adına sahip müşteri zaten mevcut.";

    private final CustomerRepository customerRepository;
    private final CustomerNameNormalizer customerNameNormalizer;

    public void assertNotDuplicateForCreate(
            String taxNumber,
            String companyName
    ) {
        assertNotDuplicate(taxNumber, companyName, null);
    }

    public void assertNotDuplicateForUpdate(
            String taxNumber,
            String companyName,
            UUID customerId
    ) {
        assertNotDuplicate(taxNumber, companyName, customerId);
    }

    public boolean isDuplicateForCreate(
            String taxNumber,
            String companyName
    ) {
        return isDuplicate(taxNumber, companyName, null);
    }

    private void assertNotDuplicate(
            String taxNumber,
            String companyName,
            UUID excludeCustomerId
    ) {
        if (isDuplicate(taxNumber, companyName, excludeCustomerId)) {
            if (hasTaxNumber(taxNumber)) {
                throw new BusinessException(TAX_NUMBER_DUPLICATE_MESSAGE);
            }

            throw new BusinessException(COMPANY_NAME_DUPLICATE_MESSAGE);
        }
    }

    private boolean isDuplicate(
            String taxNumber,
            String companyName,
            UUID excludeCustomerId
    ) {
        if (hasTaxNumber(taxNumber)) {
            return excludeCustomerId == null
                    ? customerRepository.existsByActiveTrueAndTaxNumber(taxNumber)
                    : customerRepository.existsByActiveTrueAndTaxNumberAndIdNot(
                            taxNumber,
                            excludeCustomerId
                    );
        }

        String normalizedCompanyName =
                customerNameNormalizer.normalizeForDuplicateCheck(companyName);

        if (normalizedCompanyName.isBlank()) {
            return false;
        }

        List<Customer> candidates =
                customerRepository.findActiveCustomersWithoutTaxNumber();

        for (Customer candidate : candidates) {
            if (excludeCustomerId != null
                    && excludeCustomerId.equals(candidate.getId())) {
                continue;
            }

            String candidateNormalized =
                    customerNameNormalizer.normalizeForDuplicateCheck(
                            candidate.getCompanyName()
                    );

            if (normalizedCompanyName.equals(candidateNormalized)) {
                return true;
            }
        }

        return false;
    }

    private boolean hasTaxNumber(String taxNumber) {
        return taxNumber != null && !taxNumber.isBlank();
    }
}
