package com.veli.tahsilat.auth.service.AuthService;

import com.veli.tahsilat.auth.dto.request.LoginRequest;
import com.veli.tahsilat.auth.dto.request.RegisterRequest;
import com.veli.tahsilat.auth.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}