package com.veli.tahsilat.collection.importexcel.dto;

import com.veli.tahsilat.collection.enums.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class ParsedCollectionImportRow {

    private int rowNumber;

    private LocalDate collectionDate;

    private String customerName;

    private PaymentType paymentType;

    private BigDecimal amount;

    private LocalDate maturityDate;

    private UUID customerId;
}
