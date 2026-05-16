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

import com.veli.tahsilat.security.jwt.JwtService;

import org.springframework.security.core.userdetails.UserDetails;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl
        implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;

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

        String jwtToken=
                jwtService.generateToken(
                        new org.springframework.security.core.userdetails.User(

                                user.getEmail(),

                                user.getPassword(),

                                java.util.List.of()
                        )
                );

        return AuthResponse.builder()
                .accessToken(jwtToken)
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

        User user = userRepository.findByEmail(
                request.getEmail()
        ).orElseThrow();

        String jwtToken =
                jwtService.generateToken(

                        new org.springframework.security.core.userdetails.User(

                                user.getEmail(),

                                user.getPassword(),

                                java.util.List.of()
                        )
                );

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .tokenType("Bearer")
                .build();
    }
}