import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Log in
        page.goto("http://localhost:5173/login")
        page.get_by_label("Email").fill("admin@dagboek.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()
        expect(page).to_have_url("http://localhost:5173/")

        # Navigate to a project and then the notebook
        page.get_by_role("link", name="Test Project").first.click()
        expect(page).to_have_url(re.compile(r"/projects/.*"))
        page.get_by_role("link", name="Notebook").click()
        expect(page).to_have_url(re.compile(r"/projects/.*/notebook"))

        # Create a new note
        page.get_by_role("button", name="New Note").click()
        expect(page.get_by_text("New Note", exact=True).first).to_be_visible()

        # Switch to the Drawing tab
        page.get_by_role("tab", name="Drawing").click()

        # Verify canvas is visible
        canvas = page.locator(".tl-canvas")
        expect(canvas).to_be_visible()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/drawing-pad-view.png")

    finally:
        context.close()
        browser.close()

with sync_playwright() as p:
    run_verification(p)
