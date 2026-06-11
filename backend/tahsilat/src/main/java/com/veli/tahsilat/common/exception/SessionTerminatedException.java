package com.veli.tahsilat.common.exception;

public class SessionTerminatedException extends RuntimeException {

    public static final String MESSAGE = "SESSION_TERMINATED";

    public SessionTerminatedException() {
        super(MESSAGE);
    }
}
