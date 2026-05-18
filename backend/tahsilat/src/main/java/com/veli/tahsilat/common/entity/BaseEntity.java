package com.veli.tahsilat.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private LocalDateTime createdAt =
            LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt =
            LocalDateTime.now();
}