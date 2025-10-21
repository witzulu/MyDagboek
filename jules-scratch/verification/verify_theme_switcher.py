from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173/")
    page.screenshot(path="jules-scratch/verification/login-page.png")
    page.click("text=Neon")
    page.screenshot(path="jules-scratch/verification/login-page-neon.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
