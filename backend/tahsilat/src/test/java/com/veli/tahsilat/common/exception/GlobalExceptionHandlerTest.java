package com.veli.tahsilat.common.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler globalExceptionHandler = new GlobalExceptionHandler();

    @Test
    void handleUnhandledException_shouldReturnSanitized500() {
        String sensitiveDetail = "SECRET_DB_PASSWORD=hunter2; at com.veli.tahsilat.internal.Repo.query(Repo.java:42)";
        RuntimeException ex = new RuntimeException(sensitiveDetail);

        ResponseEntity<ApiErrorResponse> result =
                globalExceptionHandler.handleUnhandledException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, result.getStatusCode());

        ApiErrorResponse body = result.getBody();
        assertNotNull(body);
        assertFalse(body.isSuccess());
        assertEquals("Beklenmeyen bir hata oluştu.", body.getMessage());
        assertNotNull(body.getTimestamp());
    }

    @Test
    void handleUnhandledException_shouldNotLeakExceptionMessageOrClassName() {
        String sensitiveDetail = "jdbc:postgresql://internal-host:5432/prod_db?password=hunter2";
        RuntimeException ex = new RuntimeException(sensitiveDetail);

        ResponseEntity<ApiErrorResponse> result =
                globalExceptionHandler.handleUnhandledException(ex);

        String message = result.getBody().getMessage();

        assertFalse(message.contains(sensitiveDetail));
        assertFalse(message.contains(ex.getClass().getName()));
        assertFalse(message.contains(RuntimeException.class.getSimpleName()));
        assertFalse(message.toLowerCase().contains("stacktrace"));
        assertFalse(message.toLowerCase().contains("exception"));
    }

    @Test
    void handleUnhandledException_shouldReturnSameSanitizedMessageRegardlessOfExceptionType() {
        ResponseEntity<ApiErrorResponse> npeResult =
                globalExceptionHandler.handleUnhandledException(new NullPointerException("null field: customer.taxNumber"));
        ResponseEntity<ApiErrorResponse> illegalStateResult =
                globalExceptionHandler.handleUnhandledException(new IllegalStateException("connection pool exhausted"));

        assertEquals("Beklenmeyen bir hata oluştu.", npeResult.getBody().getMessage());
        assertEquals("Beklenmeyen bir hata oluştu.", illegalStateResult.getBody().getMessage());
    }
}
