const { test, expect } = require('@playwright/test');

test('Theme switching changes background color', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Check initial (dark) theme
  await page.waitForSelector('body.dark-theme');
  const initialBackgroundColor = await page.evaluate(() => {
    return window.getComputedStyle(document.body).getPropertyValue('background-color');
  });
  expect(initialBackgroundColor).toBe('rgb(10, 10, 12)'); // Corresponds to hsl(240 10% 3.9%)

  // Log in to get to the settings page
  await page.fill('input[name="username"]', 'testuser');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to settings
  await page.waitForURL('**/projects');
  await page.click('a[href="/settings"]');
  await page.waitForURL('**/settings');

  // Switch to light theme
  await page.click('button:has-text("Light")');
  await page.waitForSelector('body.light-theme');

  // Verify the background color updated
  const lightThemeBackgroundColor = await page.evaluate(() => {
    return window.getComputedStyle(document.body).getPropertyValue('background-color');
  });
  expect(lightThemeBackgroundColor).toBe('rgb(255, 255, 255)'); // Corresponds to hsl(0 0% 100%)
  await page.screenshot({ path: 'jules-scratch/verification/light-theme-background.png' });

  // Switch to blue theme
  await page.click('button:has-text("Ocean")');
  await page.waitForSelector('body.blue-theme');

  const blueThemeBackgroundColor = await page.evaluate(() => {
    return window.getComputedStyle(document.body).getPropertyValue('background-color');
  });
  expect(blueThemeBackgroundColor).toBe('rgb(16, 29, 35)'); // Corresponds to hsl(202 40% 9%)
  await page.screenshot({ path: 'jules-scratch/verification/blue-theme-background.png' });
});
