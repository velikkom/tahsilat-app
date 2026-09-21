package com.veli.tahsilat.collection;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CreditCardToMailOrderMigrationTest {

    @Test
    void v14ConvertsCreditCardRowsWithoutChangingCountsOrAmounts() throws Exception {
        String sql;
        try (var input = CreditCardToMailOrderMigrationTest.class.getResourceAsStream(
                "/db/migration/V14__convert_credit_card_to_mail_order.sql"
        )) {
            assertTrue(input != null, "V14 migration resource is missing");
            sql = new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }

        String updateSql = sql.lines()
                .filter((line) -> !line.isBlank() && !line.trim().startsWith("--"))
                .collect(java.util.stream.Collectors.joining("\n"));

        assertTrue(sql.contains("payment_type = 'MAIL_ORDER'"));
        assertTrue(sql.contains("payment_type = 'CREDIT_CARD'"));

        try (Connection connection = DriverManager.getConnection(
                "jdbc:h2:mem:cc2mo;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
                "sa",
                ""
        )) {
            try (Statement statement = connection.createStatement()) {
                statement.execute("""
                        CREATE TABLE collections (
                            id UUID PRIMARY KEY,
                            payment_type VARCHAR(50) NOT NULL,
                            amount NUMERIC(19,2) NOT NULL,
                            active BOOLEAN NOT NULL
                        )
                        """);
            }

            insertRow(connection, "CREDIT_CARD", "100.00");
            insertRow(connection, "CREDIT_CARD", "250.50");
            insertRow(connection, "MAIL_ORDER", "40.00");
            insertRow(connection, "CASH", "10.00");

            Snapshot before = snapshot(connection);

            assertEquals(4, before.totalCount);
            assertEquals(0, new BigDecimal("400.50").compareTo(before.totalAmount));
            assertEquals(2, before.creditCardCount);
            assertEquals(1, before.mailOrderCount);

            try (Statement statement = connection.createStatement()) {
                statement.execute(updateSql);
            }

            Snapshot after = snapshot(connection);

            assertEquals(before.totalCount, after.totalCount);
            assertEquals(0, before.totalAmount.compareTo(after.totalAmount));
            assertEquals(0, after.creditCardCount);
            assertEquals(before.mailOrderCount + before.creditCardCount, after.mailOrderCount);
        }
    }

    private void insertRow(Connection connection, String paymentType, String amount) throws Exception {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO collections (id, payment_type, amount, active) VALUES (?, ?, ?, TRUE)"
        )) {
            statement.setObject(1, UUID.randomUUID());
            statement.setString(2, paymentType);
            statement.setBigDecimal(3, new BigDecimal(amount));
            statement.executeUpdate();
        }
    }

    private Snapshot snapshot(Connection connection) throws Exception {
        int totalCount = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        int creditCardCount = 0;
        int mailOrderCount = 0;

        try (Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(
                     "SELECT payment_type, COUNT(*) AS n, COALESCE(SUM(amount), 0) AS total FROM collections GROUP BY payment_type"
             )) {
            while (resultSet.next()) {
                String paymentType = resultSet.getString("payment_type");
                int count = resultSet.getInt("n");
                BigDecimal amount = resultSet.getBigDecimal("total");

                totalCount += count;
                totalAmount = totalAmount.add(amount);

                if ("CREDIT_CARD".equals(paymentType)) {
                    creditCardCount = count;
                }

                if ("MAIL_ORDER".equals(paymentType)) {
                    mailOrderCount = count;
                }
            }
        }

        return new Snapshot(totalCount, totalAmount, creditCardCount, mailOrderCount);
    }

    private record Snapshot(
            int totalCount,
            BigDecimal totalAmount,
            int creditCardCount,
            int mailOrderCount
    ) {
    }
}
