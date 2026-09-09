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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TripAccessControlTest {

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

    private User salesmanA;
    private User salesmanB;
    private User admin;

    @BeforeEach
    void setUp() {
        tripRepository.deleteAll();
        userRepository.deleteAll();

        salesmanA = saveUser("salesman-a@test.com", Role.ROLE_SALESMAN);
        salesmanB = saveUser("salesman-b@test.com", Role.ROLE_SALESMAN);
        admin = saveUser("admin@test.com", Role.ROLE_ADMIN);
    }

    @Test
    void salesmanCannotGetAnotherSalesmansTrip() throws Exception {
        String tokenA = login(salesmanA.getEmail());
        String tokenB = login(salesmanB.getEmail());

        String tripId = createTrip(tokenA);

        mockMvc.perform(get("/api/v1/trips/" + tripId)
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isNotFound());
    }

    @Test
    void salesmanCannotUpdateAnotherSalesmansTrip() throws Exception {
        String tokenA = login(salesmanA.getEmail());
        String tokenB = login(salesmanB.getEmail());

        String tripId = createTrip(tokenA);

        mockMvc.perform(put("/api/v1/trips/" + tripId)
                        .header("Authorization", bearer(tokenB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(tripRequestJson()))
                .andExpect(status().isNotFound());
    }

    @Test
    void ownerCanGetTheirOwnTrip() throws Exception {
        String tokenA = login(salesmanA.getEmail());

        String tripId = createTrip(tokenA);

        mockMvc.perform(get("/api/v1/trips/" + tripId)
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(tripId));
    }

    @Test
    void adminCanGetAnySalesmansTrip() throws Exception {
        String tokenA = login(salesmanA.getEmail());
        String adminToken = login(admin.getEmail());

        String tripId = createTrip(tokenA);

        mockMvc.perform(get("/api/v1/trips/" + tripId)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk());
    }

    private String createTrip(String token) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/trips")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(tripRequestJson()))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("id").asText();
    }

    private String tripRequestJson() {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(2);

        return """
                {"startDate":"%s","endDate":"%s","vehiclePlate":"20 ABC 20","dailyExpenses":[]}
                """.formatted(start, end);
    }

    private User saveUser(String email, Role role) {
        return userRepository.saveAndFlush(User.builder()
                .firstName("Test")
                .lastName(role.name())
                .email(email)
                .password(passwordEncoder.encode(PASSWORD))
                .role(role)
                .active(true)
                .newUser(false)
                .build());
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

    private static String bearer(String token) {
        return "Bearer " + token;
    }
}
