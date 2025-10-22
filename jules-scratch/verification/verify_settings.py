import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Listen for all console events and print them
    page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

    # Log in as admin
    page.goto("http://localhost:5174/login")

    email_input = page.locator('input[name="email"]')
    password_input = page.locator('input[name="password"]')

    email_input.wait_for(state="visible")
    page.screenshot(path="jules-scratch/verification/login_page.png")

    email_input.fill("admin@dagboek.com")
    password_input.fill("password")
    page.get_by_role("button", name="Login").click(force=True)

    # Go to the settings page
    page.goto("http://localhost:5174/settings")

    # Click the debug link to the admin page
    page.get_by_role("link", name="Go to Admin Page").click()

    # Wait for the admin page to load and take a screenshot
    page.wait_for_timeout(5000)
    page.screenshot(path="jules-scratch/verification/admin_dashboard.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
