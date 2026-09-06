package com.veli.tahsilat.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.common.importer.CustomerExcelImporter;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.enums.Role;
import com.veli.tahsilat.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CollectionIdorAccessTest {

    private static final String PASSWORD = "Password1";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CollectionRepository collectionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private CustomerExcelImporter customerExcelImporter;

    private User salesmanA;
    private User salesmanB;
    private Customer customer;
    private Collection salesmanACollection;

    @BeforeEach
    void setUp() {
        collectionRepository.deleteAll();
        customerRepository.deleteAll();
        userRepository.deleteAll();

        salesmanA = saveUser("sales-a@test.com", Role.ROLE_SALESMAN);
        salesmanB = saveUser("sales-b@test.com", Role.ROLE_SALESMAN);
        saveUser("admin@test.com", Role.ROLE_ADMIN);

        customer = new Customer();
        customer.setCompanyName("Test Musteri");
        customer.setAuthorizedPerson("Ali");
        customer.setPhone("555");
        customer = customerRepository.saveAndFlush(customer);

        salesmanACollection = saveCollection(salesmanA, new BigDecimal("1500.00"));
    }

    @Test
    void salesmanCannotAccessAnotherSalesmansCollectionById() throws Exception {
        String tokenB = login(salesmanB.getEmail());
        UUID foreignId = salesmanACollection.getId();
        String updateBody = """
                {
                  "customerId": "%s",
                  "amount": 2000,
                  "collectionDate": "2026-09-05",
                  "paymentType": "CASH",
                  "description": "idor"
                }
                """.formatted(customer.getId());

        mockMvc.perform(get("/api/v1/collections/{id}", foreignId)
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/v1/collections/{id}", foreignId)
                        .header("Authorization", bearer(tokenB))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/collections/{id}", foreignId)
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/collections")
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]", foreignId).isEmpty());

        mockMvc.perform(get("/api/v1/collections/{id}", foreignId)
                        .header("Authorization", bearer(login(salesmanA.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(foreignId.toString()));
    }

    @Test
    void salesmanCannotSeeAnotherSalesmansCollectionsByCustomerId() throws Exception {
        String tokenB = login(salesmanB.getEmail());

        mockMvc.perform(get("/api/v1/collections/customer/{customerId}", customer.getId())
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]", salesmanACollection.getId()).isEmpty());

        mockMvc.perform(get("/api/v1/collections/customer/{customerId}", customer.getId())
                        .header("Authorization", bearer(login(salesmanA.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]", salesmanACollection.getId()).isNotEmpty());
    }

    @Test
    void salesmanCannotSeeAnotherSalesmansOverdueCollections() throws Exception {
        Collection overdueCollection = saveOverdueCollection(salesmanA);

        String tokenB = login(salesmanB.getEmail());

        mockMvc.perform(get("/api/v1/collections/overdue")
                        .header("Authorization", bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]", overdueCollection.getId()).isEmpty());

        mockMvc.perform(get("/api/v1/collections/overdue")
                        .header("Authorization", bearer(login(salesmanA.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]", overdueCollection.getId()).isNotEmpty());
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

    private Collection saveCollection(User owner, BigDecimal amount) {
        Collection collection = new Collection();
        collection.setCustomer(customer);
        collection.setAmount(amount);
        collection.setCollectionDate(LocalDate.of(2026, 9, 1));
        collection.setPaymentType(PaymentType.CASH);
        collection.setStatus(CollectionStatus.PAID);
        collection.setDescription("owned");
        collection.setCollectedBy(owner);
        return collectionRepository.saveAndFlush(collection);
    }

    private Collection saveOverdueCollection(User owner) {
        Collection collection = new Collection();
        collection.setCustomer(customer);
        collection.setAmount(new BigDecimal("500.00"));
        collection.setCollectionDate(LocalDate.of(2026, 1, 1));
        collection.setMaturityDate(LocalDate.of(2026, 1, 15));
        collection.setPaymentType(PaymentType.CHECK);
        collection.setStatus(CollectionStatus.PENDING);
        collection.setDescription("overdue");
        collection.setCollectedBy(owner);
        return collectionRepository.saveAndFlush(collection);
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
