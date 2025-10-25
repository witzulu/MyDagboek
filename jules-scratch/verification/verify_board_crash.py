
import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Set the auth token in local storage
    page.goto("http://localhost:5173")
    page.evaluate("localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjhmYzhiZWY2MDJhZTZiNTcxZjkyMTBhIiwicm9sZSI6ImFkbWluIn0sImlhdCI6MTc2MTM4Mjk3NiwiZXhwIjoxNzYxNDAwOTc2fQ.lmGS_Q59UeQBTH67EI59dte80UuPy2DS5tJsfoFO1lo')")
    page.reload()

    # Navigate to the board
    page.goto("http://localhost:5173/boards/68fc92666184efe0952c6658")

    # Verify the page loaded and take a screenshot
    page.wait_for_url(re.compile(r"http://localhost:5173/boards/.+"))
    expect(page.get_by_text("Test Board 2")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/verification.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
