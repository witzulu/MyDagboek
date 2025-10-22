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

    # Go to the admin page and take a screenshot
    page.goto("http://localhost:5173/admin")
    expect(page.get_by_role("heading", name="Admin Dashboard")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/admin_dashboard.png")

    # Go to the settings page and take a screenshot
    page.goto("http://localhost:5173/settings")
    expect(page.get_by_role("heading", name="Your Settings")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/user_settings.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
