import { test, expect } from "@playwright/test";

test.describe("static site", () => {
  test("homepage loads with nav and hero", async ({ page }) => {
    await page.goto("/");

    // Visible navigation.
    await expect(page.locator("nav").first()).toBeVisible();

    // Hero heading renders with text. Assert on attachment + content rather
    // than strict visibility to stay resilient to entrance animations.
    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeAttached();
    await expect(heading).not.toBeEmpty();
  });

  test("main sections render", async ({ page }) => {
    await page.goto("/");
    for (const id of [
      "about",
      "skills",
      "experience",
      "projects",
      "certifications",
      "contact",
    ]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("contact form renders all inputs and a submit button", async ({
    page,
  }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();

    for (const field of ["name", "email", "subject", "message"]) {
      await expect(contact.locator(`#${field}`)).toBeAttached();
      await expect(contact.locator(`#${field}`)).toBeEditable();
    }

    await expect(
      contact.getByRole("button", { name: /send message/i })
    ).toBeAttached();
  });

  test("submitting empty form shows validation toast and stays on page", async ({
    page,
  }) => {
    await page.goto("/");
    const url = page.url();

    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();
    await contact.getByRole("button", { name: /send message/i }).click();

    // The validation message surfaces via a toast.
    await expect(page.getByText("Please complete all fields.")).toBeVisible({
      timeout: 5000,
    });

    // Did not navigate away.
    expect(page.url()).toBe(url);
  });
});
