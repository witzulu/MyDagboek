
import { test, expect } from '@playwright/test';

test.describe('Time Tracking Feature', () => {
  let page;
  let context;
  const projectName = `Test Project ${Date.now()}`;
  const taskTitle = 'My Test Task for Time Tracking';
  const timeEntryNote = 'This is a test time entry note.';

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // Log in
    await page.goto('http://localhost:5173/login');
    await page.getByPlaceholder('Enter your email').fill('admin@dagboek.com');
    await page.getByPlaceholder('Enter your password').fill('admin');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('http://localhost:5173/projects');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

    // Create a new project
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByLabel('Project Name').fill(projectName);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForSelector(`text=${projectName}`);

    // Navigate to the new project's board
    await page.getByRole('link', { name: projectName }).click();
    await page.getByRole('link', { name: 'Boards' }).click();
    await page.waitForURL(/\/projects\/.*\/boards/);

    // Create a new board
    await page.getByRole('button', { name: 'New Board' }).click();
    await page.getByLabel('Board Name').fill('Main Test Board');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForSelector('text=Main Test Board');

    // Go to the board
    await page.getByRole('link', { name: 'Main Test Board' }).click();
    await page.waitForSelector('text=To-Do');

    // Add a new task
    await page.getByPlaceholder('Enter task title...').first().fill(taskTitle);
    await page.getByRole('button', { name: 'Add Task' }).first().click();
    await page.waitForSelector(`text=${taskTitle}`);
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

  test('should add, view, and delete a time entry', async () => {
    // 1. ADD a new time entry from the task card
    const cardLocator = page.locator('.card', { hasText: taskTitle });
    await cardLocator.locator('button[aria-label="Options"]').click();
    await page.getByRole('menuitem', { name: 'Add Time Entry' }).click();
    await expect(page.getByRole('heading', { name: 'Log Time' })).toBeVisible();

    const today = new Date().toISOString().split('T')[0];
    await page.getByLabel('Date').fill(today);
    await page.getByLabel('Duration (HH:MM)').fill('02:45');
    await page.getByLabel('Note').fill(timeEntryNote);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('heading', { name: 'Log Time' })).not.toBeVisible();
    await expect(page.getByText('Time entry saved.')).toBeVisible();

    // 2. VIEW the new entry on the Time Tracking page
    await page.getByRole('link', { name: 'Time Tracking' }).click();
    await page.waitForURL(/\/projects\/.*\/time-tracking/);
    await expect(page.getByRole('cell', { name: taskTitle })).toBeVisible();
    await expect(page.getByRole('cell', { name: '02:45' })).toBeVisible();
    const entryRow = page.locator('tr', { hasText: timeEntryNote });
    await expect(entryRow).toBeVisible();

    // 3. DELETE the time entry
    await page.on('dialog', dialog => dialog.accept()); // Automatically accept the confirm dialog
    await entryRow.getByRole('button', { name: 'Delete' }).click();

    // Verify the entry is removed from the UI
    await expect(page.getByText('Time entry deleted.')).toBeVisible();
    await expect(entryRow).not.toBeVisible();
  });
});
