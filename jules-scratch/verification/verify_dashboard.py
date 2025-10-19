from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the login page
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle", timeout=60000)
    print("Page loaded")
    page.screenshot(path="jules-scratch/verification/login-page.png")

    # Log in
    page.wait_for_selector('input[placeholder="Enter your username"]')
    page.locator('input[placeholder="Enter your username"]').fill("testuser")
    page.locator('input[placeholder="Enter your password"]').fill("password")
    page.get_by_role("button", name="Sign In").click()

    # Take a screenshot of the dashboard in dark mode
    page.screenshot(path="jules-scratch/verification/dashboard-dark.png")

    # Switch to light mode
    page.get_by_role("button").nth(1).click()

    # Take a screenshot of the dashboard in light mode
    page.screenshot(path="jules-scratch/verification/dashboard-light.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
