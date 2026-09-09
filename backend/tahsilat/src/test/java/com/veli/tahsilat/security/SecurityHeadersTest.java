package com.veli.tahsilat.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityHeadersTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void publicEndpointResponseIncludesContentTypeOptionsHeader() throws Exception {
        mockMvc.perform(get("/api/v1/auth/login"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"));
    }

    @Test
    void publicEndpointResponseIncludesFrameOptionsHeader() throws Exception {
        mockMvc.perform(get("/api/v1/auth/login"))
                .andExpect(header().string("X-Frame-Options", "DENY"));
    }

    @Test
    void publicEndpointResponseIncludesReferrerPolicyHeader() throws Exception {
        mockMvc.perform(get("/api/v1/auth/login"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"));
    }
}
