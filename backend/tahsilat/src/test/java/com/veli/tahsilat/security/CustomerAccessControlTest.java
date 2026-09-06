package com.veli.tahsilat.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veli.tahsilat.collection.repository.CollectionRepository;
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

import com.veli.tahsilat.common.importer.CustomerExcelImporter;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CustomerAccessControlTest {

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

    private User admin;
    private User salesman;
    private User accounting;
    private Customer activeCustomer;
    private Customer inactiveCustomer;

    @BeforeEach
    void setUp() {
        collectionRepository.deleteAll();
        customerRepository.deleteAll();
        userRepository.deleteAll();

        admin = saveUser("admin@test.com", Role.ROLE_ADMIN);
        salesman = saveUser("salesman@test.com", Role.ROLE_SALESMAN);
        accounting = saveUser("accounting@test.com", Role.ROLE_ACCOUNTING);

        activeCustomer = saveCustomer("Active Musteri", true);
        inactiveCustomer = saveCustomer("Inactive Musteri", false);
    }

    @Test
    void adminSeesAllCustomersIncludingInactive() throws Exception {
        String token = login(admin.getEmail());

        mockMvc.perform(get("/api/v1/customers")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]", activeCustomer.getId()).isNotEmpty())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]", inactiveCustomer.getId()).isNotEmpty());
    }

    @Test
    void salesmanSeesOnlyActiveCustomers() throws Exception {
        String token = login(salesman.getEmail());

        mockMvc.perform(get("/api/v1/customers")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]", activeCustomer.getId()).isNotEmpty())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]", inactiveCustomer.getId()).isEmpty());
    }

    @Test
    void accountingIsForbiddenFromCustomerList() throws Exception {
        String token = login(accounting.getEmail());

        mockMvc.perform(get("/api/v1/customers")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Forbidden"));
    }

    @Test
    void unauthenticatedRequestWithoutTokenIsRejected() throws Exception {
        // No Authorization header at all: Spring Security's default entry point
        // rejects this with a bare 403 (empty body) before it ever reaches
        // GlobalExceptionHandler. This differs from the ACCOUNTING case above,
        // which is an authenticated-but-insufficient-role AccessDeniedException
        // that IS routed through GlobalExceptionHandler and returns a JSON body.
        mockMvc.perform(get("/api/v1/customers"))
                .andExpect(status().isForbidden())
                .andExpect(content().string(""));
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

    private Customer saveCustomer(String companyName, boolean active) {
        Customer customer = new Customer();
        customer.setCompanyName(companyName);
        customer.setAuthorizedPerson("Ali");
        customer.setPhone("555");
        customer.setActive(active);
        return customerRepository.saveAndFlush(customer);
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
