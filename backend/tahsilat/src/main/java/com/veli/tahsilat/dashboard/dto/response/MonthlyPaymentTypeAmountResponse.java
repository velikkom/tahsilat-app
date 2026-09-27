package com.veli.tahsilat.dashboard.dto.response;

import com.veli.tahsilat.collection.enums.PaymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class MonthlyPaymentTypeAmountResponse {

    private PaymentType paymentType;

    private BigDecimal amount;
}
