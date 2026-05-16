package com.veli.tahsilat.customer.entity;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;

import java.util.UUID;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String companyName;

    private String authorizedPerson;

    private String phone;

    @Column(unique = true)
    private String taxNumber;

    private String address;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}