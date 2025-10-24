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

        # Navigate to the first project, then boards
        page.get_by_role("link", name=re.compile(r"Project", re.IGNORECASE)).first.click()
        page.wait_for_url(re.compile(r"/projects/"))
        page.get_by_role("link", name="Boards").click()
        page.wait_for_url(re.compile(r"/boards"))
        page.get_by_role("link", name=re.compile(r"board", re.IGNORECASE)).first.click()
        page.wait_for_url(re.compile(r"/boards/"))

        # 1. Create a new card
        page.get_by_role("button", name="+ Add a card").first.click()
        expect(page.get_by_role("heading", name="Create Card")).to_be_visible()
        page.get_by_placeholder("Card title").fill("My New Test Card")
        page.get_by_placeholder("Card description").fill("This is a test description.")
        page.get_by_role("button", name="Save").click()

        # Verify card creation
        expect(page.get_by_text("My New Test Card")).to_be_visible()

        # 2. Edit the card
        page.get_by_text("My New Test Card").click()
        expect(page.get_by_role("heading", name="Edit Card")).to_be_visible()
        page.get_by_placeholder("Card title").fill("My Edited Test Card")
        page.get_by_role("button", name="Save").click()

        # Verify card edit
        expect(page.get_by_text("My Edited Test Card")).to_be_visible()

        # 3. Drag and drop the card
        source_card = page.get_by_text("My Edited Test Card")
        target_list = page.get_by_text("In Progress")
        source_card.drag_to(target_list)

        # Verify card move
        in_progress_list = page.locator('.//div[h2[text()="In Progress"]]')
        expect(in_progress_list.get_by_text("My Edited Test Card")).to_be_visible()

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
