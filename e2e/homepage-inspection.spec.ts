import { test, expect } from "@playwright/test";

test.describe("Homepage Inspection", () => {
  test("should inspect homepage structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Take a screenshot for reference
    await page.screenshot({ path: "homepage-screenshot.png", fullPage: true });

    // Log page structure
    console.log("=== PAGE STRUCTURE ===");
    console.log("Title:", await page.title());
    console.log("URL:", page.url());

    // Check for navigation elements
    const nav = page.locator("nav, header").first();
    if (await nav.isVisible()) {
      console.log("Navigation found");
      const navLinks = nav.locator("a");
      const linkCount = await navLinks.count();
      console.log(`Navigation has ${linkCount} links`);

      for (let i = 0; i < linkCount; i++) {
        const link = navLinks.nth(i);
        const text = await link.textContent();
        const href = await link.getAttribute("href");
        console.log(`Link ${i}: "${text}" -> ${href}`);
      }
    }

    // Check for main content
    const main = page.locator("main, .main, #main").first();
    if (await main.isVisible()) {
      console.log("Main content found");
    }

    // Look for buttons
    const buttons = page.locator('button, .btn, [role="button"]');
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons`);

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      console.log(`Button ${i}: "${text}"`);
    }

    // Check for common elements
    const headings = page.locator("h1, h2, h3");
    const headingCount = await headings.count();
    console.log(`Found ${headingCount} headings`);

    for (let i = 0; i < Math.min(headingCount, 3); i++) {
      const heading = headings.nth(i);
      const text = await heading.textContent();
      const tag = await heading.evaluate((el) => el.tagName);
      console.log(`${tag}: "${text}"`);
    }
  });
});
