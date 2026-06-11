package com.veli.tahsilat.auth.service.AuthService;

import com.veli.tahsilat.auth.dto.request.LoginRequest;
import com.veli.tahsilat.auth.dto.request.RegisterRequest;
import com.veli.tahsilat.auth.dto.response.AuthResponse;
import com.veli.tahsilat.auth.dto.response.RegisterResponse;
import com.veli.tahsilat.auth.dto.response.SessionResponse;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void logout(String email);

    SessionResponse checkSession();
}
