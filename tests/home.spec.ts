import { expect, test } from '@playwright/test';

test('loads the home page and featured demo mission', async ({ page }) => {
  await page.goto('/');

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toContainText('SIXMA');
  await expect(main.locator('a[href="/mission/D001"]')).toBeVisible();

  await page.goto('/mission/D001');

  await expect(page).toHaveURL(/\/mission\/D001$/);
  await expect(page.getByRole('main')).toBeVisible();
});
