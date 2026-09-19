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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression coverage for BUG-003: CHECK/PROMISSORY_NOTE must start PENDING
 * (they settle on their maturity date, not at creation) while every other
 * payment type keeps the pre-existing immediate-PAID behavior. Also covers
 * the overdue endpoint and dashboard pending/paid totals that depend on
 * this lifecycle.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CollectionStatusLifecycleTest {

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
                .firstName("Status")
                .lastName("Tester")
                .email("status-lifecycle@test.com")
                .password(passwordEncoder.encode(PASSWORD))
                .role(Role.ROLE_SALESMAN)
                .active(true)
                .newUser(false)
                .build());

        customer = new Customer();
        customer.setCompanyName("Status Lifecycle Musteri");
        customer = customerRepository.saveAndFlush(customer);
    }

    @ParameterizedTest
    @EnumSource(value = PaymentType.class, names = {
            "CASH", "BANK_TRANSFER", "CREDIT_CARD", "MAIL_ORDER", "POS_YKB", "POS_TEB"
    })
    void immediateSettlementTypesAreCreatedPaid(PaymentType paymentType) throws Exception {
        String token = login();

        String body = """
                {
                  "customerId": "%s",
                  "amount": 100,
                  "collectionDate": "2026-09-19",
                  "paymentType": "%s"%s
                }
                """.formatted(
                customer.getId(),
                paymentType,
                paymentType == PaymentType.MAIL_ORDER ? ", \"mailOrderCompany\": \"Test\"" : ""
        );

        mockMvc.perform(post("/api/v1/collections")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PAID"));
    }

    @Test
    void checkWithFutureMaturityIsCreatedPending() throws Exception {
        assertCreatedStatus(PaymentType.CHECK, LocalDate.now().plusMonths(1), "PENDING");
    }

    @Test
    void checkWithPastMaturityIsCreatedPending() throws Exception {
        assertCreatedStatus(PaymentType.CHECK, LocalDate.now().minusMonths(1), "PENDING");
    }

    @Test
    void promissoryNoteWithFutureMaturityIsCreatedPending() throws Exception {
        assertCreatedStatus(PaymentType.PROMISSORY_NOTE, LocalDate.now().plusMonths(1), "PENDING");
    }

    @Test
    void promissoryNoteWithPastMaturityIsCreatedPending() throws Exception {
        assertCreatedStatus(PaymentType.PROMISSORY_NOTE, LocalDate.now().minusMonths(1), "PENDING");
    }

    @Test
    void pastMaturityCheckAppearsInOverdueEndpoint() throws Exception {
        String token = login();

        String collectionId = createCollection(
                token,
                PaymentType.CHECK,
                LocalDate.now().minusMonths(2),
                new BigDecimal("500.00")
        );

        mockMvc.perform(get("/api/v1/collections/overdue")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]".formatted(collectionId)).isNotEmpty());
    }

    @Test
    void futureMaturityCheckDoesNotAppearInOverdueEndpoint() throws Exception {
        String token = login();

        String collectionId = createCollection(
                token,
                PaymentType.CHECK,
                LocalDate.now().plusMonths(2),
                new BigDecimal("500.00")
        );

        mockMvc.perform(get("/api/v1/collections/overdue")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]".formatted(collectionId)).isEmpty());
    }

    @Test
    void dashboardPendingAndPaidTotalsReflectStatus() throws Exception {
        String token = login();

        createCollection(token, PaymentType.CASH, null, new BigDecimal("1000.00"));
        createCollection(token, PaymentType.CHECK, LocalDate.now().minusDays(10), new BigDecimal("250.00"));

        mockMvc.perform(get("/api/v1/reports/dashboard-summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paidCollections").value(1000.0))
                .andExpect(jsonPath("$.pendingCollections").value(250.0))
                .andExpect(jsonPath("$.totalCollections").value(1250.0));

        mockMvc.perform(get("/api/v1/dashboard/metrics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paidAmount").value(1000.0))
                .andExpect(jsonPath("$.unpaidAmount").value(250.0));
    }

    @Test
    void updatingPaymentTypeRecomputesStatus() throws Exception {
        String token = login();

        String collectionId = createCollection(
                token,
                PaymentType.CHECK,
                LocalDate.now().plusMonths(1),
                new BigDecimal("300.00")
        );

        mockMvc.perform(get("/api/v1/collections/{id}", collectionId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.status").value("PENDING"));

        mockMvc.perform(put("/api/v1/collections/{id}", collectionId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerId": "%s",
                                  "amount": 300,
                                  "collectionDate": "2026-09-19",
                                  "paymentType": "CASH"
                                }
                                """.formatted(customer.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));
    }

    @Test
    void deletedCollectionIsExcludedFromDashboardAndOverdue() throws Exception {
        String token = login();

        String collectionId = createCollection(
                token,
                PaymentType.CHECK,
                LocalDate.now().minusDays(5),
                new BigDecimal("400.00")
        );

        mockMvc.perform(delete("/api/v1/collections/{id}", collectionId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/collections/overdue")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]".formatted(collectionId)).isEmpty());

        mockMvc.perform(get("/api/v1/reports/dashboard-summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.pendingCollections").value(0));
    }

    @Test
    void markPendingCheckAsPaid() throws Exception {
        String token = login();
        LocalDate maturityDate = LocalDate.now().minusDays(5);

        String collectionId = createCollection(
                token,
                PaymentType.CHECK,
                maturityDate,
                new BigDecimal("447000.00")
        );

        mockMvc.perform(patch("/api/v1/collections/{id}/paid", collectionId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));

        mockMvc.perform(get("/api/v1/collections/overdue")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]".formatted(collectionId)).isEmpty());

        mockMvc.perform(put("/api/v1/collections/{id}", collectionId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerId": "%s",
                                  "amount": 447000,
                                  "collectionDate": "2026-09-19",
                                  "paymentType": "CHECK",
                                  "maturityDate": "%s"
                                }
                                """.formatted(customer.getId(), maturityDate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));

        mockMvc.perform(patch("/api/v1/collections/{id}/paid", collectionId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Bu tahsilat zaten tahsil edildi olarak işaretlenmiş."));
    }

    @Test
    void markAsPaidRejectedBeforeMaturityDate() throws Exception {
        String token = login();

        String collectionId = createCollection(
                token,
                PaymentType.CHECK,
                LocalDate.now().plusDays(10),
                new BigDecimal("1000.00")
        );

        mockMvc.perform(patch("/api/v1/collections/{id}/paid", collectionId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Bu tahsilat vade tarihinde tahsil edildi olarak işaretlenebilir."));
    }

    @Test
    void dueSummaryIncludesChecksDueTodayOrEarlier() throws Exception {
        String token = login();

        String dueId = createCollection(
                token,
                PaymentType.PROMISSORY_NOTE,
                LocalDate.now(),
                new BigDecimal("136000.00")
        );
        createCollection(
                token,
                PaymentType.CHECK,
                LocalDate.now().plusDays(20),
                new BigDecimal("500.00")
        );

        mockMvc.perform(get("/api/v1/collections/due-summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1))
                .andExpect(jsonPath("$.amount").value(136000.0));

        mockMvc.perform(get("/api/v1/dashboard/metrics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pendingMaturityAmount").value(136500.0))
                .andExpect(jsonPath("$.dueMaturityCount").value(1))
                .andExpect(jsonPath("$.dueMaturityAmount").value(136000.0))
                .andExpect(jsonPath("$.paidAmount").value(0))
                .andExpect(jsonPath("$.unpaidAmount").value(136500.0));

        mockMvc.perform(get("/api/v1/dashboard/aging")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dueTodayCount").value(1))
                .andExpect(jsonPath("$.dueTodayAmount").value(136000.0))
                .andExpect(jsonPath("$.upcomingCount").value(0));

        mockMvc.perform(get("/api/v1/collections/due")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == '%s')]".formatted(dueId)).isNotEmpty());

        mockMvc.perform(patch("/api/v1/collections/{id}/paid", dueId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));
    }

    @Test
    void preExistingPaidCollectionsAreUnaffectedByLifecycleFix() throws Exception {
        // Simulates a collection persisted before this fix (directly via the
        // repository, bypassing createCollection()) to prove the status-derivation
        // change only governs new writes and does not retroactively touch
        // already-PAID rows still sitting in the database.
        Collection legacy = new Collection();
        legacy.setCustomer(customer);
        legacy.setAmount(new BigDecimal("999.00"));
        legacy.setCollectionDate(LocalDate.now().minusMonths(6));
        legacy.setMaturityDate(LocalDate.now().minusMonths(5));
        legacy.setPaymentType(PaymentType.CHECK);
        legacy.setStatus(CollectionStatus.PAID);
        legacy.setCollectedBy(salesman);
        legacy = collectionRepository.saveAndFlush(legacy);

        String token = login();

        mockMvc.perform(get("/api/v1/collections/{id}", legacy.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));

        mockMvc.perform(get("/api/v1/collections/overdue")
                        .header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.content[?(@.id == '%s')]".formatted(legacy.getId())).isEmpty());
    }

    private void assertCreatedStatus(PaymentType paymentType, LocalDate maturityDate, String expectedStatus) throws Exception {
        String token = login();

        mockMvc.perform(post("/api/v1/collections")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerId": "%s",
                                  "amount": 750,
                                  "collectionDate": "2026-09-19",
                                  "paymentType": "%s",
                                  "maturityDate": "%s"
                                }
                                """.formatted(customer.getId(), paymentType, maturityDate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(expectedStatus));
    }

    private String createCollection(String token, PaymentType paymentType, LocalDate maturityDate, BigDecimal amount) throws Exception {
        String maturityJson = maturityDate != null
                ? ", \"maturityDate\": \"%s\"".formatted(maturityDate)
                : "";

        MvcResult result = mockMvc.perform(post("/api/v1/collections")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerId": "%s",
                                  "amount": %s,
                                  "collectionDate": "2026-09-19",
                                  "paymentType": "%s"%s
                                }
                                """.formatted(customer.getId(), amount, paymentType, maturityJson)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
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
