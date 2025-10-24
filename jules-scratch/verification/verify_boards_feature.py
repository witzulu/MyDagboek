import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Log in
        page.goto("http://localhost:5173/login")
        page.get_by_label("Email").fill("admin@dagboek.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()
        expect(page).to_have_url("http://localhost:5173/projects")

        # 2. Navigate to the first project
        page.locator(".project-card").first.click()
        expect(page).to_have_url(re.compile(r"/projects/.*"))

        # Get the project ID from the URL for later navigation
        project_id = page.url.split('/')[-1]

        # 3. Click the "Boards" link
        page.get_by_role("link", name="Boards").click()
        expect(page).to_have_url(f"http://localhost:5173/projects/{project_id}/boards")

        # 4. Verify the "Boards" page is loaded
        expect(page.get_by_role("heading", name="Boards")).to_be_visible()

        # 5. Click "Create New Board"
        page.get_by_role("button", name="Create New Board").click()

        # 6. Fill out the modal form
        modal = page.locator(".bg-white.dark\\:bg-slate-800").last
        expect(modal.get_by_role("heading", name="New Board")).to_be_visible()
        modal.get_by_label("Board Name").fill("My Test Board")
        modal.get_by_label("Description").fill("This is a test board created by Playwright.")

        # 7. Submit the form
        modal.get_by_role("button", name="Create Board").click()

        # 8. Wait for the new board to appear and take a screenshot
        new_board = page.locator(".bg-white.dark\\:bg-gray-800", has_text="My Test Board").first
        expect(new_board).to_be_visible()
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
