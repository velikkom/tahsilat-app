package com.veli.tahsilat.collection.dto.response;

import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.UUID;

@Getter
@Builder
public class CollectionResponse {

    private UUID id;

    private UUID customerId;

    private String customerName;

    private BigDecimal amount;

    private LocalDate collectionDate;

    private LocalDate maturityDate;

    private PaymentType paymentType;

    private CollectionStatus status;

    private String description;

    private String receiptNumber;

    private String mikroSr;

    private String mikroNo;

    private String bankName;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}