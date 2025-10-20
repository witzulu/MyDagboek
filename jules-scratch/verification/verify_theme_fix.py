from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:5173")
    page.get_by_placeholder("Enter your username").fill("testuser")
    page.get_by_placeholder("Enter your password").fill("password")
    page.get_by_role("button", name="Sign In").click()

    # Navigate to Settings page and switch to blue theme
    page.wait_for_url("http://localhost:5173/projects")
    page.get_by_role("link", name="Settings").click()
    page.wait_for_url("http://localhost:5173/settings")
    page.select_option("#theme-select", "blue-theme")
    page.screenshot(path="jules-scratch/verification/blue-theme-fix.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
