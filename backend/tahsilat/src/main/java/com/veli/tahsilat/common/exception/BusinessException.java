package com.veli.tahsilat.common.exception;

public class BusinessException
        extends RuntimeException {

    public BusinessException(
            String message
    ) {

        super(message);
    }
}