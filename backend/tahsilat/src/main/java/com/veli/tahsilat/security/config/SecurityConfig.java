package com.veli.tahsilat.security.config;

import com.veli.tahsilat.common.util.HttpErrorResponseWriter;
import com.veli.tahsilat.security.jwt.JwtAuthenticationFilter;
import com.veli.tahsilat.security.jwt.JwtService;
import com.veli.tahsilat.security.ratelimit.AuthRateLimitFilter;
import com.veli.tahsilat.security.service.CustomUserDetailsService;
import com.veli.tahsilat.security.session.SessionValidationService;
import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            SessionValidationService sessionValidationService,
            HttpErrorResponseWriter httpErrorResponseWriter
    ) {
        return new JwtAuthenticationFilter(
                jwtService,
                userDetailsService,
                sessionValidationService,
                httpErrorResponseWriter
        );
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtAuthenticationFilterRegistration(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>(jwtAuthenticationFilter);

        registration.setEnabled(false);

        return registration;
    }

    @Bean
    public AuthRateLimitFilter authRateLimitFilter(
            @Value("${app.auth.rate-limit.enabled:true}") boolean rateLimitEnabled,
            @Value("${app.auth.rate-limit.max-attempts:5}") int maxAttempts,
            @Value("${app.auth.rate-limit.window-seconds:60}") long windowSeconds
    ) {
        return new AuthRateLimitFilter(rateLimitEnabled, maxAttempts, windowSeconds * 1000);
    }

    @Bean
    public FilterRegistrationBean<AuthRateLimitFilter> authRateLimitFilterRegistration(
            AuthRateLimitFilter authRateLimitFilter
    ) {
        FilterRegistrationBean<AuthRateLimitFilter> registration =
                new FilterRegistrationBean<>(authRateLimitFilter);

        registration.setEnabled(false);

        return registration;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthRateLimitFilter authRateLimitFilter,
            HttpErrorResponseWriter httpErrorResponseWriter,
            @Value("${app.swagger.public:false}") boolean swaggerPublic
    ) throws Exception {

        http
                .cors(cors -> {})
                .csrf(AbstractHttpConfigurer::disable)

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) ->
                                httpErrorResponseWriter.writeUnauthorized(
                                        response,
                                        "Unauthorized"
                                )
                        )
                )

                .headers(headers -> headers
                        .contentTypeOptions(Customizer.withDefaults())
                        .frameOptions(frameOptions -> frameOptions.deny())
                        .referrerPolicy(referrer -> referrer.policy(
                                ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER
                        ))
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000)
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> {
                    var requests = auth
                            .dispatcherTypeMatchers(
                                    DispatcherType.ERROR,
                                    DispatcherType.FORWARD
                            )
                            .permitAll()
                            .requestMatchers(
                                    "/api/v1/auth/register",
                                    "/api/v1/auth/login"
                            )
                            .permitAll();

                    if (swaggerPublic) {
                        requests.requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v1/api-docs/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll();
                    } else {
                        requests.requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v1/api-docs/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).denyAll();
                    }

                    requests
                            .requestMatchers("/api/v1/**")
                            .authenticated()
                            .anyRequest()
                            .authenticated();
                })

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .addFilterBefore(
                        authRateLimitFilter,
                        JwtAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService
    ) {

        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {

        return config.getAuthenticationManager();
    }
}
