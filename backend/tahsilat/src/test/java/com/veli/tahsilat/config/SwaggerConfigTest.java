package com.veli.tahsilat.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SwaggerConfigTest {

    private final SwaggerConfig swaggerConfig = new SwaggerConfig();

    @Test
    void openApiBeanDoesNotExposeAnyHardcodedProductionHost() {
        OpenAPI openAPI = swaggerConfig.customOpenAPI();

        assertNotNull(openAPI);

        boolean hasRailwayServer = openAPI.getServers() != null
                && openAPI.getServers().stream()
                        .map(Server::getUrl)
                        .filter(url -> url != null)
                        .anyMatch(url -> url.toLowerCase().contains("railway"));

        assertFalse(hasRailwayServer, "OpenAPI definition must not contain a hardcoded Railway production URL");
    }

    @Test
    void openApiBeanStillDeclaresBearerAuthSecurityScheme() {
        OpenAPI openAPI = swaggerConfig.customOpenAPI();

        assertNotNull(openAPI.getComponents());
        assertTrue(openAPI.getComponents().getSecuritySchemes().containsKey("bearerAuth"));
    }
}
