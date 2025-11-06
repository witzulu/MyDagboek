import re
from playwright.sync_api import sync_playwright, expect
import sys

def run(playwright):
    # Get project ID from command line arguments, if provided
    # Example: python jules-scratch/verify_dashboard.py <project_id>
    project_id_arg = sys.argv[1] if len(sys.argv) > 1 else None

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        print("Navigating to login page...")
        page.goto("http://localhost:5173/login")

        print("Performing login...")
        page.locator('input[name="email"]').fill("admin@example.com")
        page.locator('input[name="password"]').fill("password123")
        page.get_by_role("button", name="Sign In").click()

        expect(page).to_have_url(re.compile(r"/projects"), timeout=10000)
        print("Login successful.")

        if project_id_arg:
             print(f"Navigating directly to project ID: {project_id_arg}")
             page.goto(f"http://localhost:5173/projects/{project_id_arg}")
        else:
            print("Navigating to the first project in the list...")
            first_project_link = page.locator('.card a').first
            expect(first_project_link).to_be_visible(timeout=5000)
            first_project_link.click()

        expect(page).to_have_url(re.compile(r"/projects/"), timeout=10000)
        print("Successfully navigated to project dashboard.")

        print("Verifying dashboard statistics are loaded...")
        # Locators for the stat values
        notes_stat = page.locator('div.card:has-text("Notes") h3.text-2xl')
        tasks_stat = page.locator('div.card:has-text("Tasks") h3.text-2xl')
        errors_stat = page.locator('div.card:has-text("Open Errors") h3.text-2xl')
        snippets_stat = page.locator('div.card:has-text("Snippets") h3.text-2xl')

        # Assert that the stats are numbers, not the '...' placeholder
        expect(notes_stat).to_have_text(re.compile(r'\\d+'), timeout=15000)
        expect(tasks_stat).to_have_text(re.compile(r'\\d+'))
        expect(errors_stat).to_have_text(re.compile(r'\\d+'))
        expect(snippets_stat).to_have_text(re.compile(r'\\d+'))
        print("✓ Statistics are visible and display numeric values.")

        print("Verifying recent activity feed...")
        # The component shows one of two things: the list or a "no activity" message.
        # We need to wait for either one to be present to confirm the data has been processed.
        activity_list_selector = "ul.space-y-4"
        no_activity_selector = "p:has-text('No recent activity to show.')"

        # Wait for either the list container or the 'no activity' message to appear
        page.wait_for_selector(f"{activity_list_selector}, {no_activity_selector}", timeout=10000)

        activity_list = page.locator(activity_list_selector)
        no_activity_message = page.locator(no_activity_selector)

        # Check which element is visible and assert accordingly
        if activity_list.is_visible():
            activity_count = activity_list.locator('li').count()
            print(f"✓ Recent activity list is visible with {activity_count} item(s).")
            # This is a valid state, even with 0 items if the container is there.
        elif no_activity_message.is_visible():
            print("✓ 'No recent activity' message is correctly displayed.")
        else:
            raise Exception("Verification failed: Neither the activity list nor the 'no activity' message was found.")

        print("\\n✅ Verification successful: Project dashboard is displaying data correctly.")

    except Exception as e:
        print(f"\\n❌ Verification failed: {e}")
        screenshot_path = "jules-scratch/dashboard_verification_failure.png"
        page.screenshot(path=screenshot_path)
        print(f"A screenshot has been saved to {screenshot_path}")
    finally:
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
