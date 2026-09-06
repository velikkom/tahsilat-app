package com.veli.tahsilat.security.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceSessionIdTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(
                jwtService,
                "secretKey",
                "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9ydGVzdGluZ3B1cnBvc2VzMTIzNDU2Nzg="
        );
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
    }

    @Test
    void generateToken_shouldEmbedSessionIdClaim() {
        UUID sessionId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        User userDetails = new User(
                "user@test.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        String token = jwtService.generateToken(userDetails, sessionId);

        assertEquals(sessionId, jwtService.extractSessionId(token));
        assertEquals("user@test.com", jwtService.extractUsername(token));
        assertNotNull(jwtService.extractSessionId(token));
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValid_shouldRejectDisabledUser() {
        UUID sessionId = UUID.fromString("22222222-2222-2222-2222-222222222222");
        User enabledUser = new User(
                "user@test.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        User disabledUser = new User(
                "user@test.com",
                "password",
                false,
                true,
                true,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        String token = jwtService.generateToken(enabledUser, sessionId);

        assertFalse(jwtService.isTokenValid(token, disabledUser));
    }

    @Test
    void isTokenValid_shouldRejectExpiredToken() {
        JwtService expiredJwtService = new JwtService();
        ReflectionTestUtils.setField(
                expiredJwtService,
                "secretKey",
                "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9ydGVzdGluZ3B1cnBvc2VzMTIzNDU2Nzg="
        );
        ReflectionTestUtils.setField(expiredJwtService, "jwtExpiration", -1000L);

        UUID sessionId = UUID.fromString("33333333-3333-3333-3333-333333333333");
        User userDetails = new User(
                "user@test.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        String expiredToken = expiredJwtService.generateToken(userDetails, sessionId);

        assertThrows(
                ExpiredJwtException.class,
                () -> expiredJwtService.isTokenValid(expiredToken, userDetails)
        );
    }

    @Test
    void isTokenValid_shouldRejectTamperedSignature() {
        UUID sessionId = UUID.fromString("44444444-4444-4444-4444-444444444444");
        User userDetails = new User(
                "user@test.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        String token = jwtService.generateToken(userDetails, sessionId);

        JwtService differentKeyJwtService = new JwtService();
        ReflectionTestUtils.setField(
                differentKeyJwtService,
                "secretKey",
                "ZGlmZmVyZW50c2VjcmV0a2V5Zm9ydGVzdGluZ3B1cnBvc2VzMTIzNDU2Nzg5MA=="
        );
        ReflectionTestUtils.setField(differentKeyJwtService, "jwtExpiration", 86400000L);

        assertThrows(
                SignatureException.class,
                () -> differentKeyJwtService.isTokenValid(token, userDetails)
        );
    }
}
