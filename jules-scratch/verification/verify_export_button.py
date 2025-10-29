
import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Listen for console events and print them
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

    try:
        # 1. Log in
        page.goto("http://localhost:5173/login")
        page.get_by_label("Email").fill("admin@test.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()
        expect(page).to_have_url(re.compile(".*dashboard"))

        # 2. Navigate to a project's progress reports
        # Use a known project ID from the seed data
        project_id = "60c72b2f9b1e8a001f8e8b82"
        page.goto(f"http://localhost:5173/projects/{project_id}/reports")

        # Wait for the page to load
        expect(page.get_by_role("heading", name="Progress Reports")).to_be_visible()

        # 3. Generate a report
        page.get_by_label("Start Date").fill("2024-01-01")
        page.get_by_label("End Date").fill("2024-12-31")
        page.get_by_role("button", name="Generate Report").click()

        # Wait for the report content to appear
        expect(page.locator("#report-content")).to_be_visible(timeout=10000)

        # 4. Assert: Check if the "Export to PDF" button is visible
        export_button = page.get_by_role("button", name="Export to PDF")
        expect(export_button).to_be_visible()

        # 5. Screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

        print("Verification script ran successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
