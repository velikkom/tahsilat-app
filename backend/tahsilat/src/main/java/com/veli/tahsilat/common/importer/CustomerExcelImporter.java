package com.veli.tahsilat.common.importer;

import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;
import com.veli.tahsilat.customer.validation.CustomerDuplicateValidator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import org.springframework.core.io.ClassPathResource;

import org.springframework.stereotype.Component;

import java.io.InputStream;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        prefix = "app.customer-import",
        name = "startup-enabled",
        havingValue = "true"
)
public class CustomerExcelImporter
        implements CommandLineRunner {

    private final CustomerRepository customerRepository;
    private final CustomerDuplicateValidator customerDuplicateValidator;

    @Override
    public void run(String... args) throws Exception {
        long customerCount =
                customerRepository.count();

        if (customerCount > 0) {

            log.info(
                    "Customers already exist. Excel import skipped."
            );

            return;
        }

        ClassPathResource resource =
                new ClassPathResource(
                        "data/firmalar.xlsx"
                );

        InputStream inputStream =
                resource.getInputStream();

        Workbook workbook =
                new XSSFWorkbook(inputStream);

        Sheet sheet =
                workbook.getSheetAt(0);

        int importedCount = 0;

        boolean firstRow = true;

        for (Row row : sheet) {

            if (firstRow) {

                firstRow = false;

                continue;
            }

            if (
                    row.getCell(0) == null
                            ||
                            row.getCell(1) == null
            ) {

                continue;
            }

            String taxNumber =
                    row.getCell(0)
                            .toString()
                            .trim();

            String companyName =
                    row.getCell(1)
                            .toString()
                            .trim();

            if (
                    taxNumber.isBlank()
                            ||
                            companyName.isBlank()
            ) {

                continue;
            }

            if (customerDuplicateValidator.isDuplicateForCreate(
                    taxNumber,
                    companyName
            )) {
                continue;
            }

            Customer customer =
                    new Customer();

            customer.setTaxNumber(
                    taxNumber
            );

            customer.setCompanyName(
                    companyName
            );

            customerRepository.save(customer);

            importedCount++;
        }

        workbook.close();

        inputStream.close();

        log.info(
                "{} customers imported successfully.",
                importedCount
        );
    }
}