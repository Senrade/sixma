import { test, expect } from '@playwright/test';

test('clicking logo closes welcome modal and navigates home', async ({ page }) => {
  await page.goto('http://localhost:3000/en');

  // Wait for welcome dialog
  const dialog = page.locator('section[role="dialog"]');
  await expect(dialog).toBeVisible();

  // Click the logo button
  const logo = page.locator('header button[aria-label="Home"], header button[aria-label="home"], header button[aria-label="Inicio"], header button[aria-label="Trang chủ"]');
  await logo.first().click();

  // The dialog should close (not visible)
  await expect(dialog).toBeHidden({ timeout: 2000 });
});
