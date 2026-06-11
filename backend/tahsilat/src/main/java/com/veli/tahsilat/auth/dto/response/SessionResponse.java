package com.veli.tahsilat.auth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SessionResponse {

    private boolean success;

    private String message;
}
