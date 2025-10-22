from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173/login")
    page.get_by_label("Email").fill("admin@dagboek.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()
    page.goto("http://localhost:5173/admin")
    page.screenshot(path="jules-scratch/verification/site-settings.png")
    page.get_by_role("button", name="User Management").click()
    page.screenshot(path="jules-scratch/verification/user-management.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
