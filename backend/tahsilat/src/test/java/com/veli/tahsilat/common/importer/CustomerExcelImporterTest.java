package com.veli.tahsilat.common.importer;

import com.veli.tahsilat.customer.repository.CustomerRepository;
import com.veli.tahsilat.customer.validation.CustomerDuplicateValidator;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class CustomerExcelImporterTest {

    private final CustomerRepository customerRepository = mock(CustomerRepository.class);
    private final CustomerDuplicateValidator customerDuplicateValidator =
            mock(CustomerDuplicateValidator.class);

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(CustomerRepository.class, () -> customerRepository)
            .withBean(CustomerDuplicateValidator.class, () -> customerDuplicateValidator)
            .withUserConfiguration(ImporterConfig.class);

    @Test
    void doesNotRegisterImporterWhenFlagMissing() {
        contextRunner.run(context -> {
            assertThat(context).doesNotHaveBean(CustomerExcelImporter.class);
            verifyNoInteractions(customerRepository);
        });
    }

    @Test
    void doesNotRegisterImporterWhenFlagExplicitlyFalse() {
        contextRunner
                .withPropertyValues("app.customer-import.startup-enabled=false")
                .run(context -> {
                    assertThat(context).doesNotHaveBean(CustomerExcelImporter.class);
                    verifyNoInteractions(customerRepository);
                });
    }

    @Test
    void registersImporterWhenFlagTrue() {
        contextRunner
                .withPropertyValues("app.customer-import.startup-enabled=true")
                .run(context ->
                        assertThat(context).hasSingleBean(CustomerExcelImporter.class));
    }

    @Test
    void importsCustomersWhenNoneExist() throws Exception {
        when(customerRepository.count()).thenReturn(0L);
        when(customerDuplicateValidator.isDuplicateForCreate(anyString(), anyString()))
                .thenReturn(false);

        CustomerExcelImporter importer =
                new CustomerExcelImporter(customerRepository, customerDuplicateValidator);

        importer.run();

        verify(customerRepository).count();
        verify(customerRepository, org.mockito.Mockito.atLeastOnce()).save(any());
    }

    @Test
    void skipsImportWhenCustomersAlreadyExist() throws Exception {
        when(customerRepository.count()).thenReturn(5L);

        CustomerExcelImporter importer =
                new CustomerExcelImporter(customerRepository, customerDuplicateValidator);

        importer.run();

        verify(customerRepository).count();
        verify(customerRepository, never()).save(any());
        verifyNoInteractions(customerDuplicateValidator);
    }

    @Configuration
    @Import(CustomerExcelImporter.class)
    static class ImporterConfig {
    }
}
