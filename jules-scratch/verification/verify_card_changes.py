
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:5173/login")
    page.get_by_label("Email").fill("admin@dagboek.com")
    page.get_by_label("Password").fill("admin")
    page.get_by_role("button", name="Login").click()
    page.wait_for_url("http://localhost:5173/projects")
    page.locator("a:has-text('Test Project')").click()
    page.wait_for_url("http://localhost:5173/projects/66d30421255e26963a43a05c")
    page.locator("a:has-text('Boards')").click()
    page.wait_for_url("http://localhost:5173/projects/66d30421255e26963a43a05c/boards")
    page.locator("a:has-text('Test Board')").click()
    page.wait_for_url("http://localhost:5173/projects/66d30421255e26963a43a05c/boards/66d3042c255e26963a43a067")

    # Wait for the card to be visible
    card = page.locator(".card").first
    card.wait_for(state="visible")

    # Click the priority button
    card.get_by_role("button").first.click()

    # Take a screenshot to verify the color change
    page.screenshot(path="jules-scratch/verification/priority_toggle.png")

    # Click the card to open the modal
    card.click()

    # Wait for the modal to be visible
    modal = page.locator(".bg-base-300")
    modal.wait_for(state="visible")

    # Change the priority in the modal
    modal.get_by_label("Priority").select_option("High")

    # Save the changes
    modal.get_by_role("button", name="Save").click()

    # Re-open the modal and verify the priority
    card.click()
    modal.wait_for(state="visible")

    # Take a screenshot to verify the modal
    page.screenshot(path="jules-scratch/verification/modal_priority.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
