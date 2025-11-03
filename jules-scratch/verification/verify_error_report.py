import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:5173/login")
    page.get_by_label("Email").fill("admin@dagboek.com")
    page.get_by_label("Password").fill("admin")
    page.get_by_role("button", name="Sign In").click()

    # Navigate to the first project
    expect(page.get_by_text("Projects")).to_be_visible()
    page.locator('.project-card').first.click()

    # Navigate to error reports page
    page.get_by_role("link", name="Error Reports").click()
    expect(page.get_by_role("heading", name="Error Reports")).to_be_visible()

    # Create a new error report
    page.get_by_role("button", name="New Report").click()

    # Fill out the modal
    page.get_by_label("Title").fill("Test Error Report")
    page.get_by_label("Description").fill("This is a test error report.")
    page.get_by_label("Severity").select_option("High")
    page.get_by_label("Status").select_option("New")
    page.get_by_role("button", name="Create Report").click()

    # Verify the new report is in the table
    expect(page.get_by_text("Test Error Report")).to_be_visible()

    # Edit the new report to add an attachment
    page.get_by_role("row", name=re.compile("Test Error Report")).get_by_role("button", name="Edit").click()
    page.get_by_role("tab", name="Attachments").click()
    page.locator('input[type="file"]').set_input_files("jules-scratch/verification/test.txt")

    # Save changes and verify attachment
    page.get_by_role("button", name="Save Changes").click()
    page.get_by_role("row", name=re.compile("Test Error Report")).get_by_role("button", name="Edit").click()
    page.get_by_role("tab", name="Attachments").click()
    expect(page.get_by_text("test.txt")).to_be_visible()


    page.screenshot(path="jules-scratch/verification/error-report.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
