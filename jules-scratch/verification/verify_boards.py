import re
from playwright.sync_api import Playwright, sync_playwright, expect

def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    try:
        page.goto("http://localhost:5173/login")
    except Exception as e:
        print(f"Failed to connect to the server: {e}")
        browser.close()
        return

    page.get_by_label("Email").click()
    page.get_by_label("Email").fill("admin@dagboek.com")
    page.get_by_label("Password").click()
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the dashboard
    expect(page).to_have_url("http://localhost:5173/")

    # Click on the first project
    page.locator(".space-y-4 > div").first.click()

    # Click on the "Boards" link in the sidebar
    page.get_by_role("link", name="Boards").click()
    expect(page).to_have_url(re.compile(r"http://localhost:5173/projects/.*/boards"))

    # Wait for the boards page to load and take a screenshot
    expect(page.get_by_text("New Board")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/boards_page.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
