import { test, expect } from '@playwright/test';

test('verify settings page', async ({ page }) => {
  // Increase timeout for registration and login
  test.setTimeout(60000);

  // Register a new user
  await page.goto('http://localhost:3007/register');
  const email = `test-${Date.now()}@example.com`;

  await page.getByPlaceholder('Full Name').fill('Test User');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password', { exact: true }).fill('password123');
  await page.getByRole('button', { name: 'SIGN UP' }).click();

  // Wait for redirect to login
  await page.waitForURL('**/login', { timeout: 10000 });

  // Login
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill('password123');
  await page.getByRole('button', { name: 'LOG IN' }).click();

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Go to settings
  await page.goto('http://localhost:3007/settings');
  await page.waitForSelector('text=Edit Profile', { timeout: 10000 });

  // Take screenshot
  await page.screenshot({ path: 'settings_verified_real.png', fullPage: true });

  // Check for key elements
  await expect(page.locator('text=Display name')).toBeVisible();
  await expect(page.locator('text=Bio')).toBeVisible();
  await expect(page.locator('text=Location')).toBeVisible();
  await expect(page.locator('text=Website URL')).toBeVisible();
});
