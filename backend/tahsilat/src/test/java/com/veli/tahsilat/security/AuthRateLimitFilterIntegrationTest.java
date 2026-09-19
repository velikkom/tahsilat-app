package com.veli.tahsilat.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression coverage for BUG-001's testable half: the limiter's own logic
 * (same identity blocked past its threshold, a different identity unaffected).
 * The global test profile disables rate limiting (app.auth.rate-limit.enabled=false
 * in application-test.properties) so the many rapid logins other test classes
 * perform are never throttled; this class opts back in locally instead of
 * flipping that shared default.
 *
 * Whether request.getRemoteAddr() actually reflects the real client behind
 * Render + Cloudflare in production (the suspected root cause of the live
 * failure) cannot be verified without a real deploy - see the Phase 3 report.
 */
@SpringBootTest(properties = {
        "app.auth.rate-limit.enabled=true",
        "app.auth.rate-limit.max-attempts=3",
        "app.auth.rate-limit.window-seconds=60"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthRateLimitFilterIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void sameIdentityIsBlockedAfterThreshold() throws Exception {
        String body = """
                {"email":"rate-limit-regression@test.com","password":"wrong-password"}
                """;

        for (int attempt = 1; attempt <= 3; attempt++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));
    }

    @Test
    void differentIdentityIsNotAffectedByAnotherIdentitysAttempts() throws Exception {
        String exhausted = """
                {"email":"rate-limit-exhausted@test.com","password":"wrong-password"}
                """;
        String other = """
                {"email":"rate-limit-untouched@test.com","password":"wrong-password"}
                """;

        for (int attempt = 1; attempt <= 3; attempt++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(exhausted))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(exhausted))
                .andExpect(status().isTooManyRequests());

        // Same remote address (MockMvc's default), different email -> its own
        // bucket, so the exhausted identity above must not affect this one.
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(other))
                .andExpect(status().isUnauthorized());
    }
}
