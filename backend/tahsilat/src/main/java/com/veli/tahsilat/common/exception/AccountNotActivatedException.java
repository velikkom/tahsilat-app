package com.veli.tahsilat.common.exception;

public class AccountNotActivatedException extends RuntimeException {

    public AccountNotActivatedException() {
        super(
                "Hesabınız henüz aktif edilmemiştir. Lütfen yönetici onayını bekleyiniz."
        );
    }
}
