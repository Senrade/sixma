import { expect, test } from '@playwright/test';

test('loads the home page and featured demo mission', async ({ page }) => {
  await page.goto('/en');

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1, name: 'SIXMA' })).toBeVisible();
  await expect(main.getByRole('link', { name: 'Play demo' })).toHaveAttribute(
    'href',
    '/en/mission/D001',
  );

  await page.goto('/en/mission/D001');

  await expect(page).toHaveURL(/\/en\/mission\/D001$/);
  await expect(page.getByRole('main')).toBeVisible();
});
