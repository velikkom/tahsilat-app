package com.veli.tahsilat.collection.validation;

import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.importexcel.dto.CollectionDuplicateKey;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CollectionDuplicateValidator {

    public static final String DUPLICATE_MESSAGE =
            "Bu tahsilat daha önce sisteme kaydedilmiş.";

    private final CollectionRepository collectionRepository;

    public void assertNotDuplicate(
            UUID customerId,
            BigDecimal amount,
            LocalDate collectionDate,
            PaymentType paymentType,
            LocalDate maturityDate
    ) {
        assertNotDuplicate(
                customerId,
                amount,
                collectionDate,
                paymentType,
                maturityDate,
                null
        );
    }

    public void assertNotDuplicate(
            UUID customerId,
            BigDecimal amount,
            LocalDate collectionDate,
            PaymentType paymentType,
            LocalDate maturityDate,
            UUID excludeCollectionId
    ) {
        CollectionDuplicateKey key = CollectionDuplicateKey.of(
                customerId,
                amount,
                collectionDate,
                paymentType,
                maturityDate
        );

        if (isDuplicate(key, excludeCollectionId)) {
            throw new BusinessException(DUPLICATE_MESSAGE);
        }
    }

    public boolean isDuplicate(CollectionDuplicateKey key) {
        return isDuplicate(key, null);
    }

    public boolean isDuplicate(
            CollectionDuplicateKey key,
            UUID excludeCollectionId
    ) {
        boolean hasMaturityDate = key.getMaturityDate() != null;

        if (excludeCollectionId == null) {
            return hasMaturityDate
                    ? collectionRepository
                            .existsByCustomerIdAndAmountAndCollectionDateAndPaymentTypeAndMaturityDateAndActiveTrue(
                                    key.getCustomerId(),
                                    key.getAmount(),
                                    key.getCollectionDate(),
                                    key.getPaymentType(),
                                    key.getMaturityDate()
                            )
                    : collectionRepository
                            .existsByCustomerIdAndAmountAndCollectionDateAndPaymentTypeAndMaturityDateIsNullAndActiveTrue(
                                    key.getCustomerId(),
                                    key.getAmount(),
                                    key.getCollectionDate(),
                                    key.getPaymentType()
                            );
        }

        return hasMaturityDate
                ? collectionRepository
                        .existsByCustomerIdAndAmountAndCollectionDateAndPaymentTypeAndMaturityDateAndActiveTrueAndIdNot(
                                key.getCustomerId(),
                                key.getAmount(),
                                key.getCollectionDate(),
                                key.getPaymentType(),
                                key.getMaturityDate(),
                                excludeCollectionId
                        )
                : collectionRepository
                        .existsByCustomerIdAndAmountAndCollectionDateAndPaymentTypeAndMaturityDateIsNullAndActiveTrueAndIdNot(
                                key.getCustomerId(),
                                key.getAmount(),
                                key.getCollectionDate(),
                                key.getPaymentType(),
                                excludeCollectionId
                        );
    }

    public Map<CollectionDuplicateKey, CollectionDuplicateKey> loadActiveDuplicateKeys() {
        Map<CollectionDuplicateKey, CollectionDuplicateKey> keys = new HashMap<>();

        for (Object[] row : collectionRepository.findActiveCollectionDuplicateKeys()) {
            CollectionDuplicateKey key = CollectionDuplicateKey.of(
                    (UUID) row[0],
                    (BigDecimal) row[1],
                    (LocalDate) row[2],
                    (PaymentType) row[3],
                    (LocalDate) row[4]
            );

            keys.put(key, key);
        }

        return keys;
    }
}
