package com.veli.tahsilat.security.ratelimit;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthRateLimitFilterTest {

    private MockHttpServletRequest loginRequest(String email) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("10.0.0.1");
        request.setContentType("application/json");
        String body = "{\"email\":\"" + email + "\",\"password\":\"whatever\"}";
        request.setContent(body.getBytes(StandardCharsets.UTF_8));
        return request;
    }

    @Test
    void requestsUnderLimitAreNotRateLimited() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(true, 5, 60_000);
        AtomicInteger downstreamCalls = new AtomicInteger();
        FilterChain chain = (req, res) -> downstreamCalls.incrementAndGet();

        for (int i = 0; i < 5; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(loginRequest("user@example.com"), response, chain);
            assertNotEquals(429, response.getStatus());
        }

        assertEquals(5, downstreamCalls.get());
    }

    @Test
    void exceedingLimitReturns429WithGenericMessageAndNoLeakedDetails() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(true, 3, 60_000);
        FilterChain chain = (req, res) -> {};

        for (int i = 0; i < 3; i++) {
            filter.doFilter(loginRequest("brute@force.com"), new MockHttpServletResponse(), chain);
        }

        MockHttpServletResponse blocked = new MockHttpServletResponse();
        filter.doFilter(loginRequest("brute@force.com"), blocked, chain);

        assertEquals(429, blocked.getStatus());
        String body = blocked.getContentAsString();
        assertTrue(body.contains("Too many attempts"));
        assertFalse(body.toLowerCase().contains("brute@force.com"));
        assertFalse(body.contains("10.0.0.1"));
    }

    @Test
    void logoutAndSessionEndpointsAreNeverRateLimited() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(true, 1, 60_000);
        AtomicInteger downstreamCalls = new AtomicInteger();
        FilterChain chain = (req, res) -> downstreamCalls.incrementAndGet();

        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest logout = new MockHttpServletRequest("POST", "/api/v1/auth/logout");
            logout.setRemoteAddr("10.0.0.1");
            MockHttpServletResponse logoutResponse = new MockHttpServletResponse();
            filter.doFilter(logout, logoutResponse, chain);
            assertNotEquals(429, logoutResponse.getStatus());

            MockHttpServletRequest session = new MockHttpServletRequest("GET", "/api/v1/auth/session");
            session.setRemoteAddr("10.0.0.1");
            MockHttpServletResponse sessionResponse = new MockHttpServletResponse();
            filter.doFilter(session, sessionResponse, chain);
            assertNotEquals(429, sessionResponse.getStatus());
        }

        assertEquals(20, downstreamCalls.get());
    }

    @Test
    void disabledFilterNeverBlocksRequests() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(false, 1, 60_000);
        FilterChain chain = (req, res) -> {};

        for (int i = 0; i < 10; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(loginRequest("same@user.com"), response, chain);
            assertNotEquals(429, response.getStatus());
        }
    }

    @Test
    void requestBodyRemainsFullyReadableForDownstreamControllerAfterFilter() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(true, 5, 60_000);
        String[] capturedBody = new String[1];
        FilterChain chain = (req, res) -> {
            capturedBody[0] = new String(req.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        };

        filter.doFilter(loginRequest("keep@body.com"), new MockHttpServletResponse(), chain);

        assertNotNull(capturedBody[0]);
        assertTrue(capturedBody[0].contains("keep@body.com"));
    }
}
