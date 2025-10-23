from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Login
        page.goto("http://localhost:5173/login")
        page.get_by_label("Email").fill("admin@dagboek.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()

        # Wait for navigation to the projects page and for projects to load
        expect(page).to_have_url("http://localhost:5173/projects")
        expect(page.get_by_text("Projects")).to_be_visible()

        # Click on the first project
        page.locator(".project-card").first.click()

        # Go to notebook
        page.get_by_role("link", name="Notebook").click()
        expect(page).to_have_url(lambda url: "/notebook" in url)

        # Verify notes are loaded
        expect(page.get_by_text("All Notes")).to_be_visible()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/notebook_verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
