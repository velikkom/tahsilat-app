package com.veli.tahsilat.common.exception;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.enums.Role;
import com.veli.tahsilat.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression coverage for BUG-006: a path variable that cannot be parsed as a
 * UUID must return 400 (client error), not 500. This is distinct from a
 * well-formed but nonexistent UUID, which must keep returning 404.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class InvalidPathVariableHandlingTest {

    private static final String PASSWORD = "Password1";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CollectionRepository collectionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User user;

    @BeforeEach
    void setUp() {
        collectionRepository.deleteAll();
        userRepository.deleteAll();

        user = userRepository.saveAndFlush(User.builder()
                .firstName("Error")
                .lastName("Handling")
                .email("error-handling@test.com")
                .password(passwordEncoder.encode(PASSWORD))
                .role(Role.ROLE_ADMIN)
                .active(true)
                .newUser(false)
                .build());
    }

    @Test
    void malformedUuidPathVariableReturnsBadRequestNotServerError() throws Exception {
        String token = login();

        mockMvc.perform(get("/api/v1/collections/not-a-real-uuid")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void wellFormedButUnknownUuidStillReturnsNotFound() throws Exception {
        String token = login();

        mockMvc.perform(get("/api/v1/collections/00000000-0000-0000-0000-000000000000")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void malformedUuidOnCustomerEndpointAlsoReturnsBadRequest() throws Exception {
        String token = login();

        mockMvc.perform(get("/api/v1/customers/still-not-a-uuid")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    private String login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(user.getEmail(), PASSWORD)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("accessToken").asText();
    }
}
