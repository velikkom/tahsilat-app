package com.veli.tahsilat.security.jwt;

import com.veli.tahsilat.common.exception.SessionTerminatedException;
import com.veli.tahsilat.common.util.HttpErrorResponseWriter;
import com.veli.tahsilat.security.service.CustomUserDetailsService;
import com.veli.tahsilat.security.session.SessionValidationService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterSessionTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private SessionValidationService sessionValidationService;

    @Mock
    private HttpErrorResponseWriter httpErrorResponseWriter;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private JwtService realJwtService;
    private String validToken;
    private final UUID sessionIdA = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private final User userDetails = new User(
            "user@test.com",
            "password",
            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
    );

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        realJwtService = new JwtService();
        ReflectionTestUtils.setField(
                realJwtService,
                "secretKey",
                "dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9ydGVzdGluZ3B1cnBvc2VzMTIzNDU2Nzg="
        );
        ReflectionTestUtils.setField(realJwtService, "jwtExpiration", 86400000L);
        validToken = realJwtService.generateToken(userDetails, sessionIdA);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldRejectRequestWhenSessionValidationFails() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addHeader("Authorization", "Bearer " + validToken);

        when(jwtService.extractUsername(validToken)).thenReturn("user@test.com");
        when(userDetailsService.loadUserByUsername("user@test.com")).thenReturn(userDetails);
        when(jwtService.isTokenValid(validToken, userDetails)).thenReturn(true);
        when(jwtService.extractSessionId(validToken)).thenReturn(sessionIdA);
        doThrow(new SessionTerminatedException())
                .when(sessionValidationService)
                .validateSession("user@test.com", sessionIdA);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        verify(httpErrorResponseWriter).writeUnauthorized(
                response,
                SessionTerminatedException.MESSAGE
        );
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void shouldValidateSessionEvenWhenAuthenticationAlreadyExists() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addHeader("Authorization", "Bearer " + validToken);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                )
        );

        when(jwtService.extractUsername(validToken)).thenReturn("user@test.com");
        when(userDetailsService.loadUserByUsername("user@test.com")).thenReturn(userDetails);
        when(jwtService.isTokenValid(validToken, userDetails)).thenReturn(true);
        when(jwtService.extractSessionId(validToken)).thenReturn(sessionIdA);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        verify(sessionValidationService).validateSession(
                eq("user@test.com"),
                eq(sessionIdA)
        );
        verify(filterChain).doFilter(request, response);
    }
}
