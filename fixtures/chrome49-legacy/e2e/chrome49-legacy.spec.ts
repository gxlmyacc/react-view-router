import { test, expect } from '@playwright/test';

test('runs the Chrome 49-targeted browser bundle', async ({ page }) => {
  await page.goto('http://127.0.0.1:3149/');
  await expect(page.getByText('ReactViewRouter Chrome 49 fixture')).toBeVisible();
  await expect(page.getByTestId('route-page')).toHaveText('Chrome 49 home');

  await page.locator('#guarded').click();
  await expect(page.getByTestId('navigation-result')).toHaveText('rejected');
  await expect(page).toHaveURL('http://127.0.0.1:3149/');

  await page.locator('#details').click();
  await expect(page).toHaveURL('http://127.0.0.1:3149/details');
  await expect(page.getByTestId('route-page')).toHaveText('Chrome 49 lazy details');

  await page.locator('#back').click();
  await expect(page).toHaveURL('http://127.0.0.1:3149/');
  await expect(page.getByTestId('route-page')).toHaveText('Chrome 49 home');
});
