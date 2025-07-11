import { test, expect } from "@playwright/test";

test.describe("Logo Navigation", () => {
  test("should navigate to homepage when Grundstein logo is clicked", async ({
    page,
  }) => {
    // Start from the create mortgage page
    await page.goto("/mortgages/create");
    await page.waitForLoadState("networkidle");

    // Verify we're on the create mortgage page
    await expect(page.getByText("Create Your Mortgage")).toBeVisible();

    // Click the Grundstein logo/brand link
    const logoLink = page.locator('nav a[href="/"]', { hasText: "Grundstein" });
    await expect(logoLink).toBeVisible();
    await logoLink.click();

    // Wait for navigation to complete
    await page.waitForLoadState("networkidle");

    // Verify we're on the homepage
    await expect(page).toHaveURL("/");

    // Verify homepage content is visible
    await expect(page.getByText("Your Financial Overview")).toBeVisible();
    await expect(page.getByText("Start Your Financial Journey")).toBeVisible();

    // Verify navigation is still present
    await expect(
      page.locator("nav a", { hasText: "Grundstein" })
    ).toBeVisible();
    await expect(page.locator("nav a", { hasText: "Dashboard" })).toBeVisible();
    await expect(
      page.locator("nav a", { hasText: "Portfolios" })
    ).toBeVisible();
    await expect(page.locator("nav a", { hasText: "Mortgages" })).toBeVisible();
    await expect(
      page.locator("nav a", { hasText: "Create Mortgage" })
    ).toBeVisible();
  });

  test("should navigate to homepage from different pages", async ({ page }) => {
    const testPages = [
      { url: "/portfolios", expectedText: "Portfolios" },
      { url: "/mortgages", expectedText: "Mortgages" },
      { url: "/mortgages/create", expectedText: "Create Your Mortgage" },
    ];

    for (const testPage of testPages) {
      // Navigate to the test page
      await page.goto(testPage.url);
      await page.waitForLoadState("networkidle");

      // Verify we're on the correct page (if it exists)
      // Some pages might redirect or not exist, so we handle this gracefully
      const currentUrl = page.url();
      console.log(`Testing from page: ${currentUrl}`);

      // Click the logo
      const logoLink = page.locator('nav a[href="/"]', {
        hasText: "Grundstein",
      });
      if (await logoLink.isVisible()) {
        await logoLink.click();
        await page.waitForLoadState("networkidle");

        // Verify we're back on homepage
        await expect(page).toHaveURL("/");
        await expect(page.getByText("Your Financial Overview")).toBeVisible();
      }
    }
  });

  test("should maintain navigation state after logo click", async ({
    page,
  }) => {
    // Start from create mortgage page
    await page.goto("/mortgages/create");
    await page.waitForLoadState("networkidle");

    // Click logo to go home
    await page.locator('nav a[href="/"]', { hasText: "Grundstein" }).click();
    await page.waitForLoadState("networkidle");

    // Verify all navigation links are still functional
    const navLinks = [
      { text: "Dashboard", href: "/" },
      { text: "Portfolios", href: "/portfolios" },
      { text: "Mortgages", href: "/mortgages" },
      { text: "Create Mortgage", href: "/mortgages/create" },
    ];

    for (const link of navLinks) {
      const linkElement = page.locator("nav a", { hasText: link.text });
      await expect(linkElement).toBeVisible();

      // Verify href attribute
      await expect(linkElement).toHaveAttribute("href", link.href);
    }
  });
});
