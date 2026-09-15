package com.veli.tahsilat.trip.importexcel.dto;

import com.veli.tahsilat.collection.enums.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class ParsedTripCollectionRow {

    private int rowNumber;

    private String receiptNumber;

    private String mikroSr;

    private String mikroNo;

    private String customerName;

    private LocalDate collectionDate;

    private PaymentType paymentType;

    private BigDecimal amount;

    private LocalDate maturityDate;

    private String bankName;

    private String mailOrderCompany;
}
