package com.veli.tahsilat.common.exception;
import com.veli.tahsilat.common.exception.AccountNotActivatedException;
import com.veli.tahsilat.common.exception.ApiErrorResponse;
import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(
            ResourceNotFoundException.class
    )

    public ResponseEntity<ApiErrorResponse>
    handleResourceNotFoundException(
            ResourceNotFoundException ex
    ) {

        ApiErrorResponse response =
                ApiErrorResponse.builder()

                        .success(false)

                        .message(ex.getMessage())

                        .timestamp(
                                LocalDateTime.now()
                        )

                        .build();

        return ResponseEntity.status(
                HttpStatus.NOT_FOUND
        ).body(response);
    }

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )

    public ResponseEntity<Map<String, Object>>
    handleValidationException(
            MethodArgumentNotValidException ex
    ) {

        Map<String, String> errors =
                new HashMap<>();

        ex.getBindingResult()

                .getFieldErrors()

                .forEach(error ->

                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "success",
                false
        );

        response.put(
                "message",
                "Validation failed"
        );

        response.put(
                "errors",
                errors
        );

        response.put(
                "timestamp",
                LocalDateTime.now()
        );

        return ResponseEntity.badRequest()
                .body(response);
    }

    @ExceptionHandler(
            BusinessException.class
    )

    public ResponseEntity<ApiErrorResponse>
    handleBusinessException(
            BusinessException ex
    ) {

        ApiErrorResponse response =
                ApiErrorResponse.builder()

                        .success(false)

                        .message(ex.getMessage())

                        .timestamp(
                                LocalDateTime.now()
                        )

                        .build();

        return ResponseEntity.status(
                HttpStatus.CONFLICT
        ).body(response);
    }

    @ExceptionHandler(AccountNotActivatedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccountNotActivated(
            AccountNotActivatedException ex
    ) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiErrorResponse> handleDisabledException(
            DisabledException ex
    ) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .message(
                        "Hesabınız henüz aktif edilmemiştir. "
                                + "Lütfen yönetici onayını bekleyiniz."
                )
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentials(
            BadCredentialsException ex
    ) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .success(false)
                .message("Email veya şifre hatalı.")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
}