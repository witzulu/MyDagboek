const { test, expect } = require('@playwright/test');

test('Login page has correct initial theme', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Add a delay to give the theme time to apply
  await page.waitForTimeout(2000);

  // Check for the theme class on the body
  const bodyClass = await page.getAttribute('body', 'class');
  console.log(`Body class: ${bodyClass}`);

  // Capture a screenshot for manual inspection
  await page.screenshot({ path: 'jules-scratch/verification/initial-load.png' });

  // Assert that the theme class is present
  await expect(page.locator('body')).toHaveClass(/dark-theme|light-theme/);
});
