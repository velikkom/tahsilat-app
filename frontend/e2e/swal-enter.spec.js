import { test, expect } from "@playwright/test";

function fakeJwt() {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return `${encode({ alg: "none", typ: "JWT" })}.${encode({
    exp: Math.floor(Date.now() / 1000) + 3600,
  })}.sig`;
}

const customer = {
  id: "11111111-1111-1111-1111-111111111111",
  companyName: "Deneme Firma",
};

const collection = {
  id: "22222222-2222-2222-2222-222222222222",
  customerId: customer.id,
  customerName: customer.companyName,
  amount: 1500,
  paymentType: "CASH",
  status: "PENDING",
  collectionDate: "2026-11-01",
  maturityDate: null,
};

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

    if (url.includes("/customers?") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [customer] }),
      });
    }

    if (url.includes("/collections?") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [collection] }),
      });
    }

    if (url.includes("/collections/mail-order-companies")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: [],
        customers: [],
        items: [],
        count: 0,
        amount: 0,
      }),
    });
  });
}

test("Enter confirms and then closes collection dialogs", async ({ page }) => {
  await mockApi(page);
  await page.goto("/login");
  await page.locator("#login-email").fill("playwright@test.local");
  await page.locator("#login-password").fill("123456");
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL("**/dashboard");

  await page.goto("/collections");
  await page.locator("table").getByRole("button", { name: "Sil", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Emin misiniz?" })).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.getByText("Tahsilat başarıyla silindi.")).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.locator(".swal2-popup")).toHaveCount(0);
});

test("Enter closes the save confirmation while the collection modal stays open", async ({
  page,
}) => {
  await mockApi(page);
  await page.goto("/login");
  await page.locator("#login-email").fill("playwright@test.local");
  await page.locator("#login-password").fill("123456");
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL("**/dashboard");

  await page.goto("/collections");
  await page
    .getByRole("button", { name: "Yeni Tahsilat", exact: true })
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "Müşteri adı yazın" }).fill("Deneme");
  await page.keyboard.press("Enter");
  await dialog.locator('input[name="amount"]').fill("250");
  await dialog.getByRole("button", { name: "Kaydet" }).click();

  await expect(page.getByText("Tahsilat başarıyla oluşturuldu.")).toBeVisible();
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.locator(".swal2-popup")).toHaveCount(0);
  await expect(dialog).toBeHidden();
});
