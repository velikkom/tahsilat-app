package com.veli.tahsilat.common.importer;

import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;

import org.springframework.stereotype.Component;

import java.io.InputStream;

import java.math.BigDecimal;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        prefix = "app.collection-import",
        name = "startup-enabled",
        havingValue = "true"
)
public class CollectionExcelImporter
        implements CommandLineRunner {

    private final CollectionRepository
            collectionRepository;

    private final CustomerRepository
            customerRepository;

    @Override
    public void run(String... args)
            throws Exception {

        long collectionCount =
                collectionRepository.count();

        if (collectionCount > 0) {

            log.info(
                    "Collections already exist. Import skipped."
            );

            return;
        }

        ClassPathResource resource =
                new ClassPathResource(
                        "data/tahsilatlar.xlsx"
                );

        InputStream inputStream =
                resource.getInputStream();

        Workbook workbook =
                new XSSFWorkbook(inputStream);

        Sheet sheet =
                workbook.getSheetAt(0);

        boolean firstRow = true;

        int importedCount = 0;

        for (Row row : sheet) {

            if (firstRow) {

                firstRow = false;

                continue;
            }

            try {

                /*
                 * EXCEL COLUMN MAP
                 *
                 * 1 -> Collection Date
                 * 2 -> Customer Name
                 * 3 -> Payment Type
                 * 4 -> Amount
                 * 5 -> Maturity Date
                 */

                LocalDate collectionDate =
                        parseDate(
                                row.getCell(1)
                        );

                String customerName =
                        getCellString(
                                row.getCell(2)
                        );

                String paymentTypeText =
                        getCellString(
                                row.getCell(3)
                        );

                BigDecimal amount =
                        parseAmount(
                                row.getCell(4)
                        );

                LocalDate maturityDate =
                        parseDate(
                                row.getCell(5)
                        );

                if (
                        customerName.isBlank()
                ) {

                    continue;
                }

                Optional<Customer>
                        optionalCustomer =

                        customerRepository
                                .findAll()
                                .stream()
                                .filter(customer -> {

                                    String dbName =
                                            normalize(
                                                    customer.getCompanyName()
                                            );

                                    String excelName =
                                            normalize(
                                                    customerName
                                            );

                                    String dbNormalized =
                                            dbName.replace(
                                                    " ",
                                                    ""
                                            );

                                    String excelNormalized =
                                            excelName.replace(
                                                    " ",
                                                    ""
                                            );

                                    return dbNormalized.contains(
                                            excelNormalized
                                    )

                                            ||

                                            excelNormalized.contains(
                                                    dbNormalized
                                            );
                                })
                                .findFirst();

                if (
                        optionalCustomer.isEmpty()
                ) {

                    log.warn(
                            "Customer not found: {}",
                            customerName
                    );

                    continue;
                }

                Collection collection =
                        new Collection();

                collection.setCustomer(
                        optionalCustomer.get()
                );

                collection.setAmount(
                        amount
                );

                collection.setCollectionDate(
                        collectionDate
                );

                collection.setMaturityDate(
                        maturityDate
                );

                collection.setPaymentType(
                        mapPaymentType(
                                paymentTypeText
                        )
                );

                collection.setStatus(
                        CollectionStatus.PAID
                );

                collectionRepository.save(
                        collection
                );

                importedCount++;

            } catch (Exception e) {

                log.error(
                        "Excel row import failed. Row Number: {}",
                        row.getRowNum(),
                        e
                );
            }
        }

        workbook.close();

        inputStream.close();

        log.info(
                "{} collections imported successfully.",
                importedCount
        );
    }

    private LocalDate parseDate(
            Cell cell
    ) {

        if (cell == null) {

            return null;
        }

        try {

            if (
                    cell.getCellType()
                            == CellType.NUMERIC
            ) {

                return cell
                        .getDateCellValue()
                        .toInstant()
                        .atZone(
                                ZoneId.systemDefault()
                        )
                        .toLocalDate();
            }

            if (
                    cell.getCellType()
                            == CellType.STRING
            ) {

                String value =
                        cell.getStringCellValue()
                                .trim();

                DateTimeFormatter formatter =
                        DateTimeFormatter.ofPattern(
                                "dd.MM.yyyy"
                        );

                return LocalDate.parse(
                        value,
                        formatter
                );
            }

        } catch (Exception e) {

            log.warn(
                    "Date parse failed: {}",
                    cell
            );
        }

        return null;
    }

    private String getCellString(
            Cell cell
    ) {

        if (cell == null) {

            return "";
        }

        return cell.toString().trim();
    }

    private BigDecimal parseAmount(
            Cell cell
    ) {

        if (cell == null) {

            return BigDecimal.ZERO;
        }

        try {

            if (
                    cell.getCellType()
                            == CellType.NUMERIC
            ) {

                return BigDecimal.valueOf(
                        cell.getNumericCellValue()
                );
            }

            String value =
                    cell.getStringCellValue();

            value = value

                    .replace("₺", "")
                    .replace(" ", "")
                    .replace(".", "")
                    .replace(",", ".")

                    .trim();

            return new BigDecimal(value);

        } catch (Exception e) {

            log.error(
                    "Amount parse failed: {}",
                    cell,
                    e
            );

            return BigDecimal.ZERO;
        }
    }

    private PaymentType mapPaymentType(
            String value
    ) {

        String normalized =
                normalize(value);

        return switch (normalized) {

            case "nakit" ->
                    PaymentType.CASH;

            case "musteri ceki" ->
                    PaymentType.CHECK;

            case "musteri senedi" ->
                    PaymentType.PROMISSORY_NOTE;

            case "havale" ->
                    PaymentType.BANK_TRANSFER;

            default ->
                    PaymentType.CREDIT_CARD;
        };
    }

    private String normalize(
            String value
    ) {

        if (value == null) {

            return "";
        }

        return value

                .toLowerCase()

                .replace("ı", "i")
                .replace("İ", "i")

                .replace("ş", "s")
                .replace("Ş", "s")

                .replace("ğ", "g")
                .replace("Ğ", "g")

                .replace("ü", "u")
                .replace("Ü", "u")

                .replace("ö", "o")
                .replace("Ö", "o")

                .replace("ç", "c")
                .replace("Ç", "c")

                /* BROKEN EXCEL CHARS */

                .replace("?", "")
                .replace("�", "")

                /* COMPANY SHORTCUTS */

                .replace("san.", "san")
                .replace("tic.", "tic")
                .replace("ltd.", "ltd")
                .replace("şti.", "sti")

                /* SPECIAL CHARS */

                .replace(".", " ")
                .replace(",", " ")
                .replace("-", " ")
                .replace("/", " ")

                /* MULTIPLE SPACES */

                .replaceAll("\\s+", " ")

                .trim();
    }
}