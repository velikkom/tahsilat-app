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

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

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

        final String jwtToken;

        final String userEmail;

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        jwtToken = authHeader.substring(7);

        userEmail =
                jwtService.extractUsername(jwtToken);

        if (userEmail != null
                &&
                SecurityContextHolder.getContext()
                        .getAuthentication() == null) {

            UserDetails userDetails =
                    userDetailsService
                            .loadUserByUsername(
                                    userEmail
                            );

            if (jwtService.isTokenValid(
                    jwtToken,
                    userDetails
            )) {

                UUID jwtSessionId =
                        jwtService.extractSessionId(jwtToken);

                try {
                    sessionValidationService.validateSession(
                            userEmail,
                            jwtSessionId
                    );
                } catch (SessionTerminatedException ex) {
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
            }
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}
