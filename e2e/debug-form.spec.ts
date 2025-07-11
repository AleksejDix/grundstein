import { test, expect } from "@playwright/test";

test.describe("Debug Form", () => {
  test("should inspect the create mortgage form structure", async ({
    page,
  }) => {
    await page.goto("/mortgages/create");
    await page.waitForLoadState("networkidle");

    // Take a screenshot
    await page.screenshot({ path: "create-mortgage-form.png", fullPage: true });

    // Log all form elements
    console.log("=== FORM INSPECTION ===");

    // Check if the main form exists
    const form = page.locator("form").first();
    if (await form.isVisible()) {
      console.log("Form found");
    } else {
      console.log("No form found");
    }

    // Check all input fields
    const inputs = page.locator("input");
    const inputCount = await inputs.count();
    console.log(`Found ${inputCount} input fields`);

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const name = await input.getAttribute("name");
      const type = await input.getAttribute("type");
      const placeholder = await input.getAttribute("placeholder");
      const value = await input.getAttribute("value");
      console.log(
        `Input ${i}: id="${id}", name="${name}", type="${type}", placeholder="${placeholder}", value="${value}"`
      );
    }

    // Check all labels
    const labels = page.locator("label");
    const labelCount = await labels.count();
    console.log(`Found ${labelCount} labels`);

    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i);
      const text = await label.textContent();
      const forAttr = await label.getAttribute("for");
      console.log(`Label ${i}: text="${text}", for="${forAttr}"`);
    }

    // Check all select elements
    const selects = page.locator("select");
    const selectCount = await selects.count();
    console.log(`Found ${selectCount} select elements`);

    for (let i = 0; i < selectCount; i++) {
      const select = selects.nth(i);
      const name = await select.getAttribute("name");
      const value = await select.getAttribute("value");
      console.log(`Select ${i}: name="${name}", value="${value}"`);
    }

    // Check all buttons
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons`);

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const type = await button.getAttribute("type");
      console.log(`Button ${i}: text="${text}", type="${type}"`);
    }

    // Check page title and main headings
    console.log("Page title:", await page.title());

    const headings = page.locator("h1, h2, h3");
    const headingCount = await headings.count();
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const text = await heading.textContent();
      const tag = await heading.evaluate((el) => el.tagName);
      console.log(`${tag}: "${text}"`);
    }
  });
});
