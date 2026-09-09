package com.veli.tahsilat.auth.service.impl;

import com.veli.tahsilat.auth.dto.request.LoginRequest;
import com.veli.tahsilat.auth.dto.request.RegisterRequest;
import com.veli.tahsilat.auth.constants.SessionMessages;
import com.veli.tahsilat.auth.dto.response.AuthResponse;
import com.veli.tahsilat.auth.dto.response.RegisterResponse;
import com.veli.tahsilat.auth.dto.response.SessionResponse;
import com.veli.tahsilat.auth.service.AuthService.AuthService;
import com.veli.tahsilat.common.exception.AccountNotActivatedException;
import com.veli.tahsilat.common.exception.BusinessException;
import com.veli.tahsilat.security.jwt.JwtService;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.enums.Role;
import com.veli.tahsilat.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String REGISTER_SUCCESS_MESSAGE =
            "Kayıt talebiniz başarıyla oluşturuldu. "
                    + "Yönetici onayından sonra giriş yapabilirsiniz.";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Bu email adresi zaten kayıtlı.");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_SALESMAN)
                .active(false)
                .newUser(true)
                .build();

        userRepository.save(user);

        return RegisterResponse.builder()
                .success(true)
                .message(REGISTER_SUCCESS_MESSAGE)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new AccountNotActivatedException();
        }

        UUID sessionId = UUID.randomUUID();
        user.setCurrentSessionId(sessionId);
        userRepository.saveAndFlush(user);

        log.info("Login session created");

        String jwtToken = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        java.util.List.of(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                        user.getRole().name()
                                )
                        )
                ),
                sessionId
        );

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow();

        user.setCurrentSessionId(null);
        userRepository.saveAndFlush(user);

        log.info("Logout session cleared");
    }

    @Override
    public SessionResponse checkSession() {
        return SessionResponse.builder()
                .success(true)
                .message(SessionMessages.SESSION_VALID)
                .build();
    }
}
