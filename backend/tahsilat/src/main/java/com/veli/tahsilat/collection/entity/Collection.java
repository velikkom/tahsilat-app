package com.veli.tahsilat.collection.entity;

import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;

import com.veli.tahsilat.common.entity.BaseEntity;

import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.user.entity.User;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "collections")
public class Collection
        extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "customer_id",
            nullable = false
    )
    private Customer customer;

    private BigDecimal amount;

    private LocalDate collectionDate;

    private LocalDate maturityDate;

    private String description;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    private CollectionStatus status =
            CollectionStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collected_by")
    private User collectedBy;

    private String receiptNumber;

    private String mikroSr;

    private String mikroNo;

    private String bankName;
}