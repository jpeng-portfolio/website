import { test, expect } from "@playwright/test";

// Static-export checks for the owner-gated résumé portal. The live edge-auth
// redirect (unauthenticated /resume/files/* → Hosted UI) can only be verified
// against the deployed CloudFront distribution — see the M1.7 manual test plan.
test.describe("résumé portal", () => {
  test("portal page renders both gated download links", async ({ page }) => {
    await page.goto("/resume");

    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeAttached();
    await expect(heading).not.toBeEmpty();

    const pdf = page.locator('a[href="/resume/files/jason-paquette-resume.pdf"]');
    const docx = page.locator(
      'a[href="/resume/files/jason-paquette-resume.docx"]',
    );
    await expect(pdf).toHaveCount(1);
    await expect(docx).toHaveCount(1);
    await expect(pdf).toBeVisible();
    await expect(docx).toBeVisible();
  });

  test("portal exposes a Hosted UI sign-out link", async ({ page }) => {
    await page.goto("/resume");
    const signOut = page.getByRole("link", { name: /sign out/i });
    await expect(signOut).toHaveCount(1);
    await expect(signOut).toHaveAttribute("href", /\/logout\?/);
  });

  test("home page links to the résumé portal", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/resume"]').first()).toBeAttached();
  });
});
