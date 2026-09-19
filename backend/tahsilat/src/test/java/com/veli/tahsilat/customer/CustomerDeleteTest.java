package com.veli.tahsilat.customer;

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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression coverage for BUG-005: DELETE /customers/{id} used to return 204
 * without ever persisting active=false, because the unflushed change was
 * silently discarded by the subsequent @Modifying(clearAutomatically = true)
 * bulk query that deactivates the customer's collections.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CustomerDeleteTest {

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

    @BeforeEach
    void setUp() {
        collectionRepository.deleteAll();
        customerRepository.deleteAll();
        userRepository.deleteAll();

        admin = userRepository.saveAndFlush(User.builder()
                .firstName("Delete")
                .lastName("Admin")
                .email("customer-delete-admin@test.com")
                .password(passwordEncoder.encode(PASSWORD))
                .role(Role.ROLE_ADMIN)
                .active(true)
                .newUser(false)
                .build());
    }

    @Test
    void deletePersistsAsInactiveAndIsNotFoundAfterward() throws Exception {
        Customer customer = saveCustomer("Silinecek Musteri");
        String token = login();

        mockMvc.perform(delete("/api/v1/customers/{id}", customer.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        Customer reloaded = customerRepository.findById(customer.getId()).orElseThrow();
        assertFalse(reloaded.getActive(), "customer must be persisted as inactive after delete");

        mockMvc.perform(get("/api/v1/customers/{id}", customer.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void secondDeleteOfAnAlreadyDeletedCustomerReturnsNotFound() throws Exception {
        Customer customer = saveCustomer("Cift Silme Musteri");
        String token = login();

        mockMvc.perform(delete("/api/v1/customers/{id}", customer.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        // This is the exact "204 returned but nothing changed" symptom found live
        // in production: before the fix, this second call also returned 204.
        mockMvc.perform(delete("/api/v1/customers/{id}", customer.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletingCustomerDeactivatesTheirActiveCollections() throws Exception {
        Customer customer = saveCustomer("Tahsilatli Musteri");
        Collection collection = new Collection();
        collection.setCustomer(customer);
        collection.setAmount(new BigDecimal("500.00"));
        collection.setCollectionDate(LocalDate.now());
        collection.setPaymentType(PaymentType.CASH);
        collection.setStatus(CollectionStatus.PAID);
        collection.setCollectedBy(admin);
        collection = collectionRepository.saveAndFlush(collection);

        String token = login();

        mockMvc.perform(delete("/api/v1/customers/{id}", customer.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        Collection reloadedCollection = collectionRepository.findById(collection.getId()).orElseThrow();
        assertFalse(reloadedCollection.getActive(), "customer's collection must be deactivated alongside the customer");
    }

    @Test
    void deletingOneCustomerDoesNotAffectOthers() throws Exception {
        Customer toDelete = saveCustomer("Silinecek");
        Customer untouched = saveCustomer("Etkilenmeyecek");
        String token = login();

        mockMvc.perform(delete("/api/v1/customers/{id}", toDelete.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        Optional<Customer> reloadedUntouched = customerRepository.findByIdAndActiveTrue(untouched.getId());
        assertTrue(reloadedUntouched.isPresent(), "unrelated customer must remain active");

        mockMvc.perform(get("/api/v1/customers/{id}", untouched.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void deleteOfUnknownCustomerReturnsNotFound() throws Exception {
        String token = login();

        mockMvc.perform(delete("/api/v1/customers/{id}", "00000000-0000-0000-0000-000000000000")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    private Customer saveCustomer(String companyName) {
        Customer customer = new Customer();
        customer.setCompanyName(companyName);
        return customerRepository.saveAndFlush(customer);
    }

    private String login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(admin.getEmail(), PASSWORD)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("accessToken").asText();
    }
}
