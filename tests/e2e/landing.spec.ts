import { expect, test } from "@playwright/test";

test("landing exposes premium SaaS offer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Passe no concurso/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver planos/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Assinar Essencial" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Assinar Pro" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Assinar Elite" })).toBeVisible();
});
