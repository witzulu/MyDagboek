from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173/")
    # Fill in the username to enable the login button
    page.get_by_placeholder("Enter your username").fill("testuser")
    # Click the login button
    page.get_by_role("button", name="Sign In").click()
    # Wait for navigation to the dashboard
    page.wait_for_url("**/")
    page.screenshot(path="jules-scratch/verification/dark-theme-verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
