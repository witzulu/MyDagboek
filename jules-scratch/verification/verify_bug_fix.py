from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:5176/login")
        page.get_by_label("Email").fill("admin@dagboek.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()

        # Wait for navigation to the projects page
        page.wait_for_url("**/projects")

        # Navigate to the Admin Dashboard
        page.goto("http://localhost:5176/admin")

        # Click on the "Universal Labels" tab
        page.get_by_role("button", name="Universal Labels").click()

        # Wait for the label management UI to be visible
        page.wait_for_selector("text=Create New Universal Label")

        # Take a screenshot of the new tab
        page.screenshot(path="jules-scratch/verification/bug-fix-verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
