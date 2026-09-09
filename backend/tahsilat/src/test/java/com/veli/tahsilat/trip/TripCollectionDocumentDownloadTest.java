package com.veli.tahsilat.trip;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veli.tahsilat.trip.repository.TripRepository;
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

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TripCollectionDocumentDownloadTest {

    private static final String PASSWORD = "Password1";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        tripRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void downloadReturnsXlsxWithMagicBytesAndContentType() throws Exception {
        User salesman = saveUser("collection-doc-owner@test.com");

        String token = login(salesman.getEmail());
        String tripId = createTrip(token);

        MvcResult result = mockMvc.perform(get("/api/v1/trips/" + tripId + "/collection-document.xlsx")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(result2 -> assertEquals(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        result2.getResponse().getContentType()
                ))
                .andReturn();

        byte[] content = result.getResponse().getContentAsByteArray();

        assertEquals((byte) 0x50, content[0]);
        assertEquals((byte) 0x4B, content[1]);
    }

    @Test
    void anotherSalesmanCannotDownloadCollectionDocument() throws Exception {
        User owner = saveUser("collection-doc-owner2@test.com");
        User intruder = saveUser("collection-doc-intruder@test.com");

        String ownerToken = login(owner.getEmail());
        String intruderToken = login(intruder.getEmail());

        String tripId = createTrip(ownerToken);

        mockMvc.perform(get("/api/v1/trips/" + tripId + "/collection-document.xlsx")
                        .header("Authorization", "Bearer " + intruderToken))
                .andExpect(status().isNotFound());
    }

    private User saveUser(String email) {
        return userRepository.saveAndFlush(User.builder()
                .firstName("Test")
                .lastName("Salesman")
                .email(email)
                .password(passwordEncoder.encode(PASSWORD))
                .role(Role.ROLE_SALESMAN)
                .active(true)
                .newUser(false)
                .build());
    }

    private String createTrip(String token) throws Exception {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(1);

        MvcResult result = mockMvc.perform(post("/api/v1/trips")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"startDate":"%s","endDate":"%s","dailyExpenses":[]}
                                """.formatted(start, end)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("id").asText();
    }

    private String login(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, PASSWORD)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("accessToken").asText();
    }
}
