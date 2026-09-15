package com.veli.tahsilat.trip.importexcel;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veli.tahsilat.collection.repository.CollectionRepository;
import com.veli.tahsilat.customer.entity.Customer;
import com.veli.tahsilat.customer.repository.CustomerRepository;
import com.veli.tahsilat.trip.repository.TripRepository;
import com.veli.tahsilat.user.entity.User;
import com.veli.tahsilat.user.enums.Role;
import com.veli.tahsilat.user.repository.UserRepository;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TripExcelImportControllerTest {

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

    private User admin;
    private Customer customer;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        collectionRepository.deleteAll();
        tripRepository.deleteAll();
        customerRepository.deleteAll();
        userRepository.deleteAll();

        admin = userRepository.saveAndFlush(User.builder()
                .firstName("Veli")
                .lastName("Kara")
                .email("veli-import@test.com")
                .password(passwordEncoder.encode(PASSWORD))
                .role(Role.ROLE_ADMIN)
                .active(true)
                .newUser(false)
                .build());

        customer = new Customer();
        customer.setCompanyName("Korkmaz Oto");
        customer.setAuthorizedPerson("Ferhat");
        customer.setPhone("555");
        customer = customerRepository.saveAndFlush(customer);

        adminToken = login(admin.getEmail());
    }

    @Test
    void dryRunThenImportCreatesTripAndCollections() throws Exception {
        MockMultipartFile expenseFile = buildExpenseFile("Veli Kara");
        MockMultipartFile collectionFile = buildCollectionFile("Korkmaz Oto");

        MvcResult dryRunResult = mockMvc.perform(multipart("/api/v1/trips/import/dry-run")
                        .file(collectionFile)
                        .file(expenseFile)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode dryRunBody = objectMapper.readTree(dryRunResult.getResponse().getContentAsString());
        assertEquals(1, dryRunBody.get("totalRows").asInt());
        assertEquals(1, dryRunBody.get("validRows").asInt());
        assertEquals(0, dryRunBody.get("importedRows").asInt());
        assertEquals(0, tripRepository.count());

        MvcResult importResult = mockMvc.perform(multipart("/api/v1/trips/import")
                        .file(buildCollectionFile("Korkmaz Oto"))
                        .file(buildExpenseFile("Veli Kara"))
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode importBody = objectMapper.readTree(importResult.getResponse().getContentAsString());
        assertEquals(1, importBody.get("importedRows").asInt());
        assertNotNull(importBody.get("tripId").asText());
        assertEquals(1, tripRepository.count());
        assertEquals(1, collectionRepository.count());
    }

    @Test
    void unknownCustomerIsReportedAsIssueAndNotImported() throws Exception {
        MockMultipartFile expenseFile = buildExpenseFile("Veli Kara");
        MockMultipartFile collectionFile = buildCollectionFile("Bilinmeyen Firma");

        MvcResult result = mockMvc.perform(multipart("/api/v1/trips/import/dry-run")
                        .file(collectionFile)
                        .file(expenseFile)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertEquals(0, body.get("validRows").asInt());
        assertEquals(1, body.get("invalidRows").asInt());

        boolean hasCustomerNotFoundIssue = false;
        for (JsonNode issue : body.get("issues")) {
            if ("CUSTOMER_NOT_FOUND".equals(issue.get("issueType").asText())) {
                hasCustomerNotFoundIssue = true;
            }
        }
        assertTrue(hasCustomerNotFoundIssue);
    }

    @Test
    void unknownSalesmanBlocksImport() throws Exception {
        MockMultipartFile expenseFile = buildExpenseFile("Bilinmeyen Personel");
        MockMultipartFile collectionFile = buildCollectionFile("Korkmaz Oto");

        MvcResult result = mockMvc.perform(multipart("/api/v1/trips/import")
                        .file(collectionFile)
                        .file(expenseFile)
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertEquals(0, body.get("importedRows").asInt());
        assertTrue(body.get("tripId").isNull());
        assertEquals(0, tripRepository.count());

        boolean hasSalesmanNotFoundIssue = false;
        for (JsonNode issue : body.get("issues")) {
            if ("SALESMAN_NOT_FOUND".equals(issue.get("issueType").asText())) {
                hasSalesmanNotFoundIssue = true;
            }
        }
        assertTrue(hasSalesmanNotFoundIssue);
    }

    @Test
    void reimportingTheSameWeekReportsDuplicateCollectionRow() throws Exception {
        mockMvc.perform(multipart("/api/v1/trips/import")
                        .file(buildCollectionFile("Korkmaz Oto"))
                        .file(buildExpenseFile("Veli Kara"))
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk());

        MvcResult secondResult = mockMvc.perform(multipart("/api/v1/trips/import/dry-run")
                        .file(buildCollectionFile("Korkmaz Oto"))
                        .file(buildExpenseFile("Veli Kara"))
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(secondResult.getResponse().getContentAsString());
        assertEquals(1, body.get("duplicateRows").asInt());
        assertEquals(0, body.get("validRows").asInt());
    }

    private MockMultipartFile buildExpenseFile(String salesmanName) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("ÖN");

            setString(sheet, 0, 2, "DENOTO KOLL.ŞTİ.AİT SATIŞ PERSONELİ HARCAMA DÖKÜMANIDIR");
            setString(sheet, 4, 0, "TARİH");
            setDate(sheet, 4, 1, LocalDate.of(2026, 8, 18));
            setString(sheet, 5, 0, "YEMEK BEDELİ");
            setNumeric(sheet, 5, 1, 100);
            setString(sheet, 14, 2, "SATIŞ PERSONELİ");
            setString(sheet, 14, 3, salesmanName);
            setString(sheet, 14, 5, "PLAKA");
            setString(sheet, 14, 6, "20 AIJ 672");

            return toMultipartFile(workbook, "expenseFile", "expense.xlsx");
        }
    }

    private MockMultipartFile buildCollectionFile(String customerName) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("ARKA");

            setString(sheet, 0, 4, "TAHSİLAT DÖKÜMÜDÜR");

            Row row = getOrCreateRow(sheet, 4);
            row.createCell(0).setCellValue(1);
            row.createCell(1).setCellValue("10609");
            row.createCell(4).setCellValue(customerName);
            row.createCell(5).setCellValue(java.sql.Date.valueOf(LocalDate.of(2026, 8, 18)));
            row.createCell(6).setCellValue("5000");

            return toMultipartFile(workbook, "collectionFile", "collection.xlsx");
        }
    }

    private void setString(Sheet sheet, int rowIndex, int col, String value) {
        getOrCreateRow(sheet, rowIndex).createCell(col).setCellValue(value);
    }

    private void setNumeric(Sheet sheet, int rowIndex, int col, double value) {
        getOrCreateRow(sheet, rowIndex).createCell(col).setCellValue(value);
    }

    private void setDate(Sheet sheet, int rowIndex, int col, LocalDate date) {
        getOrCreateRow(sheet, rowIndex).createCell(col).setCellValue(java.sql.Date.valueOf(date));
    }

    private Row getOrCreateRow(Sheet sheet, int rowIndex) {
        Row row = sheet.getRow(rowIndex);
        return row == null ? sheet.createRow(rowIndex) : row;
    }

    private MockMultipartFile toMultipartFile(Workbook workbook, String paramName, String filename) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);

        return new MockMultipartFile(
                paramName,
                filename,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                outputStream.toByteArray()
        );
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
