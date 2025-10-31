import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Login
    await page.goto('http://localhost:5173/login');
    await page.getByLabel('Email').fill('admin@dagboek.com');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('http://localhost:5173/projects');
    console.log('✅ Login successful.');

    // Get project ID from local storage to construct the URL
    const projectId = await page.evaluate(() => JSON.parse(localStorage.getItem('selectedProject'))._id);

    // 2. Navigate to the Time Tracking page
    const timeTrackingUrl = `http://localhost:5173/projects/${projectId}/time`;
    await page.goto(timeTrackingUrl);
    await page.waitForURL(timeTrackingUrl);
    console.log(`✅ Navigated to Time Tracking page: ${timeTrackingUrl}`);

    // 3. Verify that the "Daily Summary" chart is visible
    const chartTitle = page.getByText('Daily Summary');
    await chartTitle.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ "Daily Summary" title is visible.');

    const chartCanvas = page.locator('.recharts-surface');
    await chartCanvas.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Chart canvas is visible.');

    console.log('🎉 Verification successful! The chart is displayed correctly.');

    const screenshotPath = `/app/jules-scratch/chart-success.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);

  } catch (error) {
    console.error('❌ Verification failed:', error);
    const screenshotPath = `/app/jules-scratch/chart-failure.png`;
    await page.screenshot({ path: screenshotPath });
    console.error(`Screenshot saved to ${screenshotPath}`);
  } finally {
    await browser.close();
  }
}

run();
