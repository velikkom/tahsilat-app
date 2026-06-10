package com.veli.tahsilat.collection.repository;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.importexcel.dto.CollectionDuplicateKey;
import com.veli.tahsilat.collection.validation.CollectionDuplicateValidator;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/*
 * Calistirmak icin lokal PostgreSQL gerekir:
 * docker run -d --name tahsilat-pg-test -e POSTGRES_PASSWORD=test \
 *   -e POSTGRES_DB=tahsilat -p 55432:5432 postgres:16
 * Sonra: DUPLICATE_QUERY_TEST=true ortam degiskeni ile mvn test
 */
@EnabledIfEnvironmentVariable(named = "DUPLICATE_QUERY_TEST", matches = "true")
@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:55432/tahsilat",
        "spring.datasource.username=postgres",
        "spring.datasource.password=test",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.flyway.enabled=true"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CollectionDuplicateQueryTest {

    @Autowired
    private CollectionRepository collectionRepository;

    @Autowired
    private CustomerRepository customerRepository;

    private CollectionDuplicateValidator validator;

    private Customer customer;

    @BeforeEach
    void setUp() {
        validator = new CollectionDuplicateValidator(collectionRepository);

        customer = new Customer();
        customer.setCompanyName("SAHIN OTO TEST " + UUID.randomUUID());
        customer = customerRepository.saveAndFlush(customer);
    }

    private Collection saveCollection(
            BigDecimal amount,
            LocalDate collectionDate,
            PaymentType paymentType,
            LocalDate maturityDate
    ) {
        Collection collection = new Collection();
        collection.setCustomer(customer);
        collection.setAmount(amount);
        collection.setCollectionDate(collectionDate);
        collection.setPaymentType(paymentType);
        collection.setMaturityDate(maturityDate);
        collection.setStatus(CollectionStatus.PAID);
        return collectionRepository.saveAndFlush(collection);
    }

    private CollectionDuplicateKey key(
            BigDecimal amount,
            LocalDate collectionDate,
            PaymentType paymentType,
            LocalDate maturityDate
    ) {
        return CollectionDuplicateKey.of(
                customer.getId(),
                amount,
                collectionDate,
                paymentType,
                maturityDate
        );
    }

    @Test
    void duplicateDetected_whenMaturityDateIsNull() {
        saveCollection(
                new BigDecimal("30000"),
                LocalDate.of(2025, 4, 23),
                PaymentType.CASH,
                null
        );

        boolean duplicate = validator.isDuplicate(
                key(
                        new BigDecimal("30000"),
                        LocalDate.of(2025, 4, 23),
                        PaymentType.CASH,
                        null
                )
        );

        assertTrue(duplicate, "Null maturityDate duplicate YAKALANAMADI");
    }

    @Test
    void duplicateDetected_whenMaturityDatePresent() {
        saveCollection(
                new BigDecimal("30000"),
                LocalDate.of(2025, 4, 23),
                PaymentType.PROMISSORY_NOTE,
                LocalDate.of(2026, 7, 31)
        );

        boolean duplicate = validator.isDuplicate(
                key(
                        new BigDecimal("30000"),
                        LocalDate.of(2025, 4, 23),
                        PaymentType.PROMISSORY_NOTE,
                        LocalDate.of(2026, 7, 31)
                )
        );

        assertTrue(duplicate, "MaturityDate'li duplicate YAKALANAMADI");
    }

    @Test
    void duplicateDetected_withDifferentAmountScale() {
        // 30000 vs 30000.00 — normalize edilen amount ayni kabul edilmeli
        saveCollection(
                new BigDecimal("30000"),
                LocalDate.of(2025, 4, 23),
                PaymentType.CASH,
                null
        );

        boolean duplicate = validator.isDuplicate(
                key(
                        new BigDecimal("30000.00"),
                        LocalDate.of(2025, 4, 23),
                        PaymentType.CASH,
                        null
                )
        );

        assertTrue(duplicate, "Farkli scale'li ayni tutar duplicate YAKALANAMADI");
    }

    @Test
    void noDuplicate_whenExcludingSameRecordOnUpdate() {
        Collection saved = saveCollection(
                new BigDecimal("30000"),
                LocalDate.of(2025, 4, 23),
                PaymentType.CASH,
                null
        );

        boolean duplicate = validator.isDuplicate(
                key(
                        new BigDecimal("30000"),
                        LocalDate.of(2025, 4, 23),
                        PaymentType.CASH,
                        null
                ),
                saved.getId()
        );

        assertFalse(duplicate, "Update'te kaydin kendisi duplicate sayildi");
    }

    @Test
    void duplicateDetected_onUpdateConflictingWithOtherRecord() {
        saveCollection(
                new BigDecimal("30000"),
                LocalDate.of(2025, 4, 23),
                PaymentType.PROMISSORY_NOTE,
                LocalDate.of(2026, 7, 31)
        );

        Collection other = saveCollection(
                new BigDecimal("15000"),
                LocalDate.of(2025, 5, 10),
                PaymentType.PROMISSORY_NOTE,
                LocalDate.of(2026, 8, 15)
        );

        boolean duplicate = validator.isDuplicate(
                key(
                        new BigDecimal("30000"),
                        LocalDate.of(2025, 4, 23),
                        PaymentType.PROMISSORY_NOTE,
                        LocalDate.of(2026, 7, 31)
                ),
                other.getId()
        );

        assertTrue(duplicate, "Update'te baska kayitla cakisma YAKALANAMADI");
    }

    @Test
    void noDuplicate_whenAmountDiffers() {
        saveCollection(
                new BigDecimal("30000"),
                LocalDate.of(2025, 4, 23),
                PaymentType.CASH,
                null
        );

        boolean duplicate = validator.isDuplicate(
                key(
                        new BigDecimal("15000"),
                        LocalDate.of(2025, 4, 23),
                        PaymentType.CASH,
                        null
                )
        );

        assertFalse(duplicate, "Farkli tutar duplicate sayildi");
    }
}
