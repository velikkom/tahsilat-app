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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TripListSortAndFilterTest {

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

    @BeforeEach
    void setUp() {
        tripRepository.deleteAll();
        userRepository.deleteAll();

        salesmanA = saveUser("salesman-a@test.com", Role.ROLE_SALESMAN);
        salesmanB = saveUser("salesman-b@test.com", Role.ROLE_SALESMAN);
    }

    @Test
    void tripsAreSortedByStartDateDescendingByDefault() throws Exception {
        String token = login(salesmanA.getEmail());

        createTrip(token, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 3));
        createTrip(token, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 3));

        mockMvc.perform(get("/api/v1/trips").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].startDate").value("2026-09-01"))
                .andExpect(jsonPath("$.content[1].startDate").value("2026-01-01"));
    }

    @Test
    void dateRangeFilterExcludesNonOverlappingTrips() throws Exception {
        String token = login(salesmanA.getEmail());

        createTrip(token, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 3));
        createTrip(token, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 3));

        mockMvc.perform(get("/api/v1/trips?fromDate=2026-08-01&toDate=2026-09-30")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].startDate").value("2026-09-01"));
    }

    @Test
    void dateRangeFilterIncludesTripsThatOnlyOverlapTheEdge() throws Exception {
        String token = login(salesmanA.getEmail());

        // Trip runs 2026-08-28..2026-09-02, filter is 2026-09-01..2026-09-30:
        // ranges overlap (trip.startDate <= toDate AND trip.endDate >= fromDate).
        createTrip(token, LocalDate.of(2026, 8, 28), LocalDate.of(2026, 9, 2));

        mockMvc.perform(get("/api/v1/trips?fromDate=2026-09-01&toDate=2026-09-30")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    void salesmanCannotSeeAnotherSalesmansTripInList() throws Exception {
        String tokenA = login(salesmanA.getEmail());
        String tokenB = login(salesmanB.getEmail());

        createTrip(tokenA, LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 3));

        mockMvc.perform(get("/api/v1/trips").header("Authorization", bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(0));
    }

    @Test
    void invertedFilterRangeIsRejected() throws Exception {
        String token = login(salesmanA.getEmail());

        mockMvc.perform(get("/api/v1/trips?fromDate=2026-09-30&toDate=2026-09-01")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isConflict());
    }

    private String createTrip(String token, LocalDate startDate, LocalDate endDate) throws Exception {
        String requestJson = """
                {"startDate":"%s","endDate":"%s","vehiclePlate":"20 ABC 20","dailyExpenses":[]}
                """.formatted(startDate, endDate);

        MvcResult result = mockMvc.perform(post("/api/v1/trips")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("id").asText();
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
