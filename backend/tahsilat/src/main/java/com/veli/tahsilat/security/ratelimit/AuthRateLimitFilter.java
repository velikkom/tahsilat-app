package com.veli.tahsilat.security.ratelimit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Applies a fixed-window rate limit to POST /api/v1/auth/login and
 * POST /api/v1/auth/register only. Every other path (logout, session, ...)
 * bypasses this filter entirely.
 */
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/v1/auth/login";
    private static final String REGISTER_PATH = "/api/v1/auth/register";
    private static final String TOO_MANY_REQUESTS_BODY =
            "{\"success\":false,\"message\":\"Too many attempts. Please try again later.\"}";

    private final boolean enabled;
    private final FixedWindowRateLimiter rateLimiter;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthRateLimitFilter(boolean enabled, int maxAttempts, long windowMillis) {
        this.enabled = enabled;
        this.rateLimiter = new FixedWindowRateLimiter(maxAttempts, windowMillis);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        if (!enabled || !isRateLimitedEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        CachedBodyHttpServletRequest cachedRequest = new CachedBodyHttpServletRequest(request);
        String key = buildKey(cachedRequest);

        if (!rateLimiter.tryAcquire(key)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(TOO_MANY_REQUESTS_BODY);
            return;
        }

        filterChain.doFilter(cachedRequest, response);
    }

    private boolean isRateLimitedEndpoint(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        String path = request.getRequestURI();
        return LOGIN_PATH.equals(path) || REGISTER_PATH.equals(path);
    }

    private String buildKey(CachedBodyHttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String email = extractNormalizedEmail(request);

        return (email == null) ? ip : ip + "|" + email;
    }

    private String extractNormalizedEmail(CachedBodyHttpServletRequest request) {
        try {
            byte[] body = request.getCachedBody();
            if (body == null || body.length == 0) {
                return null;
            }

            JsonNode root = objectMapper.readTree(body);
            JsonNode emailNode = root.get("email");
            if (emailNode == null || emailNode.isNull()) {
                return null;
            }

            String email = emailNode.asText().trim().toLowerCase();
            return email.isEmpty() ? null : email;
        } catch (Exception ex) {
            return null;
        }
    }
}
