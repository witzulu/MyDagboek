import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Login
        page.goto("http://localhost:5173/login", timeout=60000)
        page.wait_for_load_state('networkidle')
        page.get_by_label("Email").fill("admin@dagboek.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()
        page.wait_for_url("http://localhost:5173/projects")

        # Navigate to the first project
        page.get_by_role("link", name=re.compile(r"Project", re.IGNORECASE)).first.click()
        page.wait_for_url(re.compile(r"/projects/"))

        # Navigate to boards
        page.get_by_role("link", name="Boards").click()
        page.wait_for_url(re.compile(r"/boards"))

        # Click on the first board
        page.get_by_role("link", name=re.compile(r"board", re.IGNORECASE)).first.click()
        page.wait_for_url(re.compile(r"/boards/"))

        # Wait for the board to load
        expect(page.get_by_role("heading", name=re.compile(r"board", re.IGNORECASE)).first).to_be_visible()

        # Expect to see the default lists
        expect(page.get_by_text("To-Do")).to_be_visible()
        expect(page.get_by_text("In Progress")).to_be_visible()
        expect(page.get_by_text("Done")).to_be_visible()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot taken successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
