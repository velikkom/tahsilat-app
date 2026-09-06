package com.veli.tahsilat.security.jwt;

import com.veli.tahsilat.common.exception.SessionTerminatedException;
import com.veli.tahsilat.common.util.HttpErrorResponseWriter;
import com.veli.tahsilat.security.service.CustomUserDetailsService;
import com.veli.tahsilat.security.session.SessionValidationService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private static final String UNAUTHORIZED_MESSAGE = "Unauthorized";

    private final JwtService jwtService;

    private final CustomUserDetailsService userDetailsService;

    private final SessionValidationService sessionValidationService;

    private final HttpErrorResponseWriter httpErrorResponseWriter;

    @Override
    protected void doFilterInternal(

            HttpServletRequest request,

            HttpServletResponse response,

            FilterChain filterChain

    ) throws ServletException, IOException {

        final String authHeader =
                request.getHeader("Authorization");

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            log.debug(
                    "JWT filter skip: no Bearer token on {} {}",
                    request.getMethod(),
                    request.getRequestURI()
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        final String jwtToken = authHeader.substring(7);
        final String userEmail;

        try {
            userEmail = jwtService.extractUsername(jwtToken);
        } catch (Exception exception) {
            SecurityContextHolder.clearContext();
            httpErrorResponseWriter.writeUnauthorized(
                    response,
                    UNAUTHORIZED_MESSAGE
            );
            return;
        }

        log.debug(
                "JWT filter processing request {} {} for user={}",
                request.getMethod(),
                request.getRequestURI(),
                maskEmail(userEmail)
        );

        if (userEmail == null) {
            log.warn(
                    "JWT filter skip: subject missing on {} {}",
                    request.getMethod(),
                    request.getRequestURI()
            );

            SecurityContextHolder.clearContext();
            httpErrorResponseWriter.writeUnauthorized(
                    response,
                    UNAUTHORIZED_MESSAGE
            );
            return;
        }

        SecurityContextHolder.clearContext();

        final UserDetails userDetails;

        try {
            userDetails = userDetailsService.loadUserByUsername(userEmail);
        } catch (UsernameNotFoundException exception) {
            httpErrorResponseWriter.writeUnauthorized(
                    response,
                    UNAUTHORIZED_MESSAGE
            );
            return;
        }

        if (!userDetails.isEnabled()
                || !jwtService.isTokenValid(jwtToken, userDetails)) {
            log.warn(
                    "JWT filter reject: token invalid or account disabled on {} {}",
                    request.getMethod(),
                    request.getRequestURI()
            );

            httpErrorResponseWriter.writeUnauthorized(
                    response,
                    UNAUTHORIZED_MESSAGE
            );
            return;
        }

        UUID jwtSessionId = jwtService.extractSessionId(jwtToken);

        log.debug(
                "JWT session validation starting on {} {}",
                request.getMethod(),
                request.getRequestURI()
        );

        try {
            sessionValidationService.validateSession(
                    userEmail,
                    jwtSessionId
            );
        } catch (SessionTerminatedException ex) {
            log.warn(
                    "Session terminated on {} {}",
                    request.getMethod(),
                    request.getRequestURI()
            );

            SecurityContextHolder.clearContext();
            httpErrorResponseWriter.writeUnauthorized(
                    response,
                    SessionTerminatedException.MESSAGE
            );

            return;
        }

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

        authToken.setDetails(
                new WebAuthenticationDetailsSource()
                        .buildDetails(request)
        );

        SecurityContextHolder.getContext()
                .setAuthentication(authToken);

        log.debug(
                "JWT authentication success on {} {}",
                request.getMethod(),
                request.getRequestURI()
        );

        filterChain.doFilter(
                request,
                response
        );
    }

    private static String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "***";
        }

        int atIndex = email.indexOf('@');

        if (atIndex <= 0) {
            return "***";
        }

        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
