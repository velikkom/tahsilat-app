package com.veli.tahsilat.auth.service.impl;

import com.veli.tahsilat.auth.dto.request.LoginRequest;
import com.veli.tahsilat.auth.dto.request.RegisterRequest;
import com.veli.tahsilat.auth.dto.response.AuthResponse;

import com.veli.tahsilat.auth.service.AuthService.AuthService;

import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.enums.Role;
import com.veli.tahsilat.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl
        implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {

        User user = User.builder()

                .firstName(request.getFirstName())

                .lastName(request.getLastName())

                .email(request.getEmail())

                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )

                .role(Role.ROLE_SALESMAN)

                .active(true)

                .build();

        userRepository.save(user);

        return AuthResponse.builder()

                .accessToken("REGISTER_SUCCESS")

                .tokenType("Bearer")

                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(

                        request.getEmail(),

                        request.getPassword()
                )
        );

        return AuthResponse.builder()

                .accessToken("LOGIN_SUCCESS")

                .tokenType("Bearer")

                .build();
    }
}