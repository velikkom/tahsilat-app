package com.veli.tahsilat.security.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.lang.reflect.Field;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CorsConfigTest {

    private final CorsConfig corsConfig = new CorsConfig();

    private CorsConfiguration resolveConfig(CorsFilter filter) throws Exception {
        Field field = CorsFilter.class.getDeclaredField("configSource");
        field.setAccessible(true);
        CorsConfigurationSource source = (CorsConfigurationSource) field.get(filter);
        return source.getCorsConfiguration(new MockHttpServletRequest());
    }

    @Test
    void explicitOriginListIsAppliedViaSetAllowedOrigins() throws Exception {
        CorsFilter filter = corsConfig.corsFilter("http://localhost:3000, http://127.0.0.1:3000");

        CorsConfiguration config = resolveConfig(filter);

        assertEquals(
                List.of("http://localhost:3000", "http://127.0.0.1:3000"),
                config.getAllowedOrigins()
        );
        assertNull(config.getAllowedOriginPatterns());
    }

    @Test
    void wildcardOriginIsRejectedWhenNoExplicitOriginRemains() {
        assertThrows(IllegalStateException.class, () -> corsConfig.corsFilter("*"));
    }

    @Test
    void blankAllowedOriginsPropertyIsRejected() {
        assertThrows(IllegalStateException.class, () -> corsConfig.corsFilter("   "));
    }

    @Test
    void wildcardEntryIsFilteredOutWhileExplicitOriginsAreKept() throws Exception {
        CorsFilter filter = corsConfig.corsFilter("*, http://localhost:3000");

        CorsConfiguration config = resolveConfig(filter);

        assertEquals(List.of("http://localhost:3000"), config.getAllowedOrigins());
    }

    @Test
    void credentialsAreAllowedOnlyWithExplicitOriginsNoWildcardPattern() throws Exception {
        CorsFilter filter = corsConfig.corsFilter("http://localhost:3000");

        CorsConfiguration config = resolveConfig(filter);

        assertTrue(config.getAllowCredentials());
        assertNull(config.getAllowedOriginPatterns());
        assertTrue(config.getAllowedOrigins().stream().noneMatch("*"::equals));
    }
}
