
import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  try {
    await page.goto('http://localhost:5173/login', { timeout: 15000 });

    // The script will likely fail here, which is fine for debugging
    await page.getByLabel('Email').fill('admin@dagboek.com');

  } catch (error) {
    console.error('--- SCRIPT FAILED ---');
    console.error(`Error during Playwright execution: ${error.name}`);
    console.error('---------------------');

    const screenshotPath = `/app/jules-scratch/login-failure-detailed-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath });
    console.error(`Screenshot saved to ${screenshotPath}`);

    console.error('\n--- BROWSER CONSOLE LOGS ---');
    if (consoleMessages.length > 0) {
        // Find the error message and log it with its full stack trace
        const errorMsg = consoleMessages.find(msg => msg.startsWith('[error]'));
        if (errorMsg) {
            console.error(errorMsg);
        } else {
            console.error(consoleMessages.join('\n'));
        }
    } else {
      console.error('No console messages were captured.');
    }
    console.error('----------------------------\n');

  } finally {
    await browser.close();
  }
}

run();
