import { test, expect } from "@playwright/test";

function fakeJwt() {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return `${encode({ alg: "none", typ: "JWT" })}.${encode({
    exp: Math.floor(Date.now() / 1000) + 3600,
  })}.sig`;
}

async function mockApi(page) {
  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes("/auth/login") && method === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accessToken: fakeJwt() }),
      });
    }

    if (url.includes("/users/me")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "00000000-0000-0000-0000-000000000001",
          firstName: "Play",
          lastName: "Wright",
          email: "playwright@test.local",
          role: "ROLE_ADMIN",
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: [],
        customers: [],
        items: [],
        months: [],
        paidAmount: 0,
        unpaidAmount: 0,
        totalElements: 0,
      }),
    });
  });
}

test("new collection form has Mailorder and no Kredi Kartı", async ({
  page,
}) => {
  const email = process.env.PLAYWRIGHT_EMAIL || "playwright@test.local";
  const password = process.env.PLAYWRIGHT_PASSWORD || "123456";
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await mockApi(page);
  await page.goto("/login");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 30_000 });

  for (const path of ["/dashboard", "/collections", "/customers", "/trips"]) {
    await page.goto(path);
    await expect(page.locator("body")).not.toContainText("Kredi Kartı — diğer");
    await expect(page.locator("body")).not.toContainText("CREDIT_CARD");
  }

  await page.goto("/collections");
  await page.getByRole("button", { name: "Yeni Tahsilat" }).click();

  const paymentSelect = page.locator("select").filter({
    has: page.locator('option[value="MAIL_ORDER"]'),
  });

  await expect(paymentSelect).toBeVisible();
  await expect(paymentSelect.locator('option[value="MAIL_ORDER"]')).toHaveCount(
    1
  );
  await expect(
    paymentSelect.locator('option[value="CREDIT_CARD"]')
  ).toHaveCount(0);
  await expect(paymentSelect).toContainText("Mailorder");
  await expect(paymentSelect).not.toContainText("Kredi Kartı");

  const criticalConsole = consoleErrors.filter(
    (text) =>
      !text.includes("favicon") &&
      !text.includes("Failed to load resource")
  );
  expect(criticalConsole, criticalConsole.join("\n")).toEqual([]);
});

test("live login page does not call localhost or Railway", async ({ page }) => {
  const liveUrl = process.env.PLAYWRIGHT_LIVE_URL;
  test.skip(!liveUrl, "Set PLAYWRIGHT_LIVE_URL");

  const requestUrls = [];
  const serverErrors = [];

  page.on("request", (request) => requestUrls.push(request.url()));
  page.on("response", (response) => {
    if (response.status() >= 500) {
      serverErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(`${liveUrl.replace(/\/$/, "")}/login`);
  await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();

  expect(serverErrors, serverErrors.join("\n")).toEqual([]);
  expect(requestUrls.some((url) => url.includes("localhost:8080"))).toBeFalsy();
  expect(requestUrls.some((url) => url.includes("railway"))).toBeFalsy();
});
