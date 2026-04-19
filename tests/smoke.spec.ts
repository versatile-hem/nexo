import { test, expect } from "@playwright/test";

test("app shell smoke", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Nexo")).toBeVisible();
});
