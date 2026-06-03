package com.veli.tahsilat.collection.importexcel.dto.response;

import com.veli.tahsilat.collection.enums.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class CollectionImportIssueResponse {

    private int rowNumber;

    private String customerName;

    private String issueType;

    private String message;

    private String normalizedCustomerName;

    private UUID matchedCustomerId;

    private String matchedCustomerName;

    private String conflictSource;

    private Integer conflictRowNumber;

    private UUID conflictCustomerId;

    private BigDecimal conflictAmount;

    private LocalDate conflictCollectionDate;

    private PaymentType conflictPaymentType;

    private LocalDate conflictMaturityDate;
}
