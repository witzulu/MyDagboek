
import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Login
        page.goto("http://localhost:5176/login")
        page.get_by_placeholder("Enter your email").fill("admin@dagboek.com")
        page.get_by_placeholder("Enter your password").fill("password")
        page.get_by_role("button", name="Login").click()

        # Wait for navigation to projects page
        expect(page).to_have_url("http://localhost:5176/projects", timeout=10000)

        # Navigate to the first project
        page.locator('a:has-text("Go to Project")').first.click()

        # Navigate to boards
        expect(page.get_by_role("heading", name=re.compile(r"Project Dashboard"))).to_be_visible(timeout=10000)
        page.get_by_role("link", name="Boards").click()

        # Navigate to the first board
        expect(page.get_by_role("heading", name="Boards")).to_be_visible(timeout=10000)
        page.locator('.bg-gray-200.dark\\:bg-gray-700.p-4.rounded-lg').first.click()

        # Open the first task card
        expect(page.locator('.p-3.rounded-md.shadow-sm.mb-2')).to_be_visible(timeout=10000)
        page.locator('.p-3.rounded-md.shadow-sm.mb-2').first.click()

        # Verify the modal and assignees section
        expect(page.get_by_role("heading", name="Edit Card")).to_be_visible(timeout=10000)
        assignees_heading = page.get_by_role("heading", name="Assignees")
        expect(assignees_heading).to_be_visible()

        # Take screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)
