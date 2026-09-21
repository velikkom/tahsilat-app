package com.veli.tahsilat.trip;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;
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

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TripPrintPreviewTest {

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
    private CustomerRepository customerRepository;

    @Autowired
    private CollectionRepository collectionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User salesmanA;
    private User salesmanB;
    private Customer customer;

    @BeforeEach
    void setUp() {
        collectionRepository.deleteAll();
        tripRepository.deleteAll();
        customerRepository.deleteAll();
        userRepository.deleteAll();

        salesmanA = saveUser("salesman-a@test.com", Role.ROLE_SALESMAN);
        salesmanB = saveUser("salesman-b@test.com", Role.ROLE_SALESMAN);

        customer = new Customer();
        customer.setCompanyName("Print Preview Musteri");
        customer.setAuthorizedPerson("Ali");
        customer.setPhone("555");
        customer = customerRepository.saveAndFlush(customer);
    }

    @Test
    void mailOrderCollectionAppearsOnPrintPreview() throws Exception {
        String tokenA = login(salesmanA.getEmail());
        String tripId = createTrip(tokenA, LocalDate.of(2026, 3, 2), LocalDate.of(2026, 3, 4));

        saveCollection(salesmanA, customer, new BigDecimal("500.00"), PaymentType.CASH);
        saveCollection(salesmanA, customer, new BigDecimal("700.00"), PaymentType.MAIL_ORDER);

        mockMvc.perform(get("/api/v1/trips/" + tripId + "/print-preview")
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collectionRows.length()").value(2))
                .andExpect(jsonPath("$.collectionTotals.cash").value(500.0))
                .andExpect(jsonPath("$.collectionTotals.mailOrder").value(700.0))
                .andExpect(jsonPath("$.collectionTotals.genelToplam").value(1200.0));
    }

    @Test
    void deletedCollectionDisappearsFromPrintPreview() throws Exception {
        String tokenA = login(salesmanA.getEmail());
        String tripId = createTrip(tokenA, LocalDate.of(2026, 3, 2), LocalDate.of(2026, 3, 4));
        Collection saved = saveCollection(salesmanA, customer, new BigDecimal("500.00"), PaymentType.CASH);

        mockMvc.perform(delete("/api/v1/collections/" + saved.getId())
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/trips/" + tripId + "/print-preview")
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collectionRows.length()").value(0))
                .andExpect(jsonPath("$.collectionTotals.cash").value(0.0))
                .andExpect(jsonPath("$.collectionTotals.genelToplam").value(0.0));
    }

    @Test
    void inactiveCustomerCollectionDisappearsFromPrintPreview() throws Exception {
        String tokenA = login(salesmanA.getEmail());
        String tripId = createTrip(tokenA, LocalDate.of(2026, 3, 2), LocalDate.of(2026, 3, 4));
        saveCollection(salesmanA, customer, new BigDecimal("500.00"), PaymentType.CASH);

        customer.setActive(false);
        customerRepository.saveAndFlush(customer);

        mockMvc.perform(get("/api/v1/trips/" + tripId + "/print-preview")
                        .header("Authorization", bearer(tokenA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collectionRows.length()").value(0))
                .andExpect(jsonPath("$.collectionTotals.cash").value(0.0));
    }

    @Test
    void salesmanCannotGetAnotherSalesmansPrintPreview() throws Exception {
        String tokenA = login(salesmanA.getEmail());
        String tokenB = login(salesmanB.getEmail());

        String tripId = createTrip(tokenA, LocalDate.of(2026, 3, 2), LocalDate.of(2026, 3, 4));

        mockMvc.perform(get("/api/v1/trips/" + tripId + "/print-preview")
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isNotFound());
    }

    private Collection saveCollection(
            User owner,
            Customer ownerCustomer,
            BigDecimal amount,
            PaymentType paymentType
    ) {
        Collection collection = new Collection();
        collection.setCustomer(ownerCustomer);
        collection.setAmount(amount);
        collection.setCollectionDate(LocalDate.of(2026, 3, 3));
        collection.setPaymentType(paymentType);
        collection.setStatus(CollectionStatus.PAID);
        collection.setCollectedBy(owner);
        return collectionRepository.saveAndFlush(collection);
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
