package com.veli.tahsilat.common.exception;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ApiErrorResponse {

    private boolean success;

    private String message;

    private LocalDateTime timestamp;
}