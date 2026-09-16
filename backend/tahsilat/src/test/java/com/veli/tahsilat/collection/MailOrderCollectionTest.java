package com.veli.tahsilat.collection;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veli.tahsilat.collection.entity.Collection;
import com.veli.tahsilat.collection.enums.CollectionStatus;
import com.veli.tahsilat.collection.enums.PaymentType;
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
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MailOrderCollectionTest {

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

    private User salesman;
    private Customer customer;

    @BeforeEach
    void setUp() {
        collectionRepository.deleteAll();
        customerRepository.deleteAll();
        userRepository.deleteAll();

        salesman = userRepository.saveAndFlush(User.builder()
                .firstName("Veli")
                .lastName("Kara")
                .email("mailorder@test.com")
                .password(passwordEncoder.encode(PASSWORD))
                .role(Role.ROLE_SALESMAN)
                .active(true)
                .newUser(false)
                .build());

        customer = new Customer();
        customer.setCompanyName("Memioglu Otomotiv");
        customer.setAuthorizedPerson("Erol");
        customer = customerRepository.saveAndFlush(customer);
    }

    @Test
    void createMailOrderCollectionUppercasesCompanyName() throws Exception {
        String token = login();

        mockMvc.perform(post("/api/v1/collections")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerId": "%s",
                                  "amount": 30000,
                                  "collectionDate": "2026-09-16",
                                  "paymentType": "MAIL_ORDER",
                                  "mailOrderCompany": "DeniOto"
                                }
                                """.formatted(customer.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentType").value("MAIL_ORDER"))
                .andExpect(jsonPath("$.mailOrderCompany").value("DEN\u0130OTO"))
                .andExpect(jsonPath("$.amount").value(30000.0));
    }

    @Test
    void updateCreditCardCollectionToMailOrder() throws Exception {
        Collection collection = new Collection();
        collection.setCustomer(customer);
        collection.setAmount(new BigDecimal("30000.00"));
        collection.setCollectionDate(LocalDate.of(2026, 9, 14));
        collection.setPaymentType(PaymentType.CREDIT_CARD);
        collection.setStatus(CollectionStatus.PAID);
        collection.setCollectedBy(salesman);
        collection = collectionRepository.saveAndFlush(collection);

        String token = login();

        mockMvc.perform(put("/api/v1/collections/{id}", collection.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerId": "%s",
                                  "amount": 30000,
                                  "collectionDate": "2026-09-14",
                                  "paymentType": "MAIL_ORDER",
                                  "mailOrderCompany": "DENOTO"
                                }
                                """.formatted(customer.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentType").value("MAIL_ORDER"))
                .andExpect(jsonPath("$.mailOrderCompany").value("DENOTO"));
    }

    @Test
    void mailOrderCompanyListIsDistinctAndUppercase() throws Exception {
        saveMailOrder("denioto");
        saveMailOrder("Başbuğ");
        saveMailOrder("DENIOTO");

        String token = login();

        mockMvc.perform(get("/api/v1/collections/mail-order-companies")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0]").value("BAŞBUĞ"))
                .andExpect(jsonPath("$[1]").value("DEN\u0130OTO"));
    }

    private void saveMailOrder(String companyName) {
        Collection collection = new Collection();
        collection.setCustomer(customer);
        collection.setAmount(new BigDecimal("100.00"));
        collection.setCollectionDate(LocalDate.of(2026, 9, 16));
        collection.setPaymentType(PaymentType.MAIL_ORDER);
        collection.setStatus(CollectionStatus.PAID);
        collection.setCollectedBy(salesman);
        collection.setMailOrderCompany(companyName);
        collectionRepository.saveAndFlush(collection);
    }

    private String login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(salesman.getEmail(), PASSWORD)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("accessToken").asText();
    }
}
