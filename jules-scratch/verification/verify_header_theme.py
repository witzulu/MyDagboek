from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Login
    page.goto("http://localhost:5173/login")
    page.get_by_label("Email").fill("admin@test.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()
    page.wait_for_url("http://localhost:5173/")

    # Open theme switcher
    page.get_by_role("button", name="Theme").click()

    # Change theme to Dracula
    page.get_by_role("button", name="Dracula").click()

    # Take screenshot of the new theme on the main page
    page.screenshot(path="jules-scratch/verification/header_theme.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
