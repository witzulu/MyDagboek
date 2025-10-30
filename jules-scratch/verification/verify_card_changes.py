
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:5174/login")
    page.get_by_label("Email").fill("admin@dagboek.com")
    page.get_by_label("Password").fill("admin")
    page.get_by_role("button", name="Login").click()
    page.wait_for_url("http://localhost:5174/projects")
    page.locator("a:has-text('Test Project')").click()
    page.wait_for_url("http://localhost:5174/projects/66d30421255e26963a43a05c")
    page.locator("a:has-text('Boards')").click()
    page.wait_for_url("http://localhost:5174/projects/66d30421255e26963a43a05c/boards")
    page.locator("a:has-text('Test Board')").click()
    page.wait_for_url("http://localhost:5174/projects/66d30421255e26963a43a05c/boards/66d3042c255e26963a43a067")

    # Wait for the card to be visible
    card = page.locator(".card").first
    card.wait_for(state="visible")

    # Click the card to open the modal
    card.click()

    # Wait for the modal to be visible
    modal = page.locator(".bg-base-300")
    modal.wait_for(state="visible")

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
