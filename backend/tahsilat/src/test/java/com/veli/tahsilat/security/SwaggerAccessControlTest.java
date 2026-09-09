package com.veli.tahsilat.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.beans.factory.annotation.Autowired;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SwaggerAccessControlTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void apiDocsAreNotPubliclyAccessibleWhenSwaggerPublicIsFalse() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isForbidden());
    }

    @Test
    void swaggerUiIsNotPubliclyAccessibleWhenSwaggerPublicIsFalse() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().isForbidden());
    }

    @Test
    void swaggerUiIndexIsNotPubliclyAccessibleWhenSwaggerPublicIsFalse() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isForbidden());
    }
}
