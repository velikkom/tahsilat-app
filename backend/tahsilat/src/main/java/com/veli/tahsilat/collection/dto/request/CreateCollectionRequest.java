package com.veli.tahsilat.collection.dto.request;

import com.veli.tahsilat.collection.enums.PaymentType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

import java.time.LocalDate;

import java.util.UUID;

@Getter
@Setter
public class CreateCollectionRequest {

    @NotNull
    private UUID customerId;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private LocalDate collectionDate;

    @NotNull
    private PaymentType paymentType;

    private LocalDate maturityDate;

    private String description;

    private String receiptNumber;

    private String mikroSr;

    private String mikroNo;

    private String bankName;
}