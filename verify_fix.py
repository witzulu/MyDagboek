
import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:5173/login")
    page.get_by_label("Email").fill("admin@dagboek.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # Navigate to the first project
    page.wait_for_url("http://localhost:5173/projects")
    page.locator(".project-card").first.click()

    # Navigate to the first board
    page.wait_for_url(re.compile(r"http://localhost:5173/projects/.+"))
    page.get_by_role("link", name="Boards").click()
    page.wait_for_url(re.compile(r"http://localhost:5173/projects/.+/boards"))
    page.locator(".board-card").first.click()

    # Wait for the board to load and take a screenshot to verify time is displayed
    page.wait_for_url(re.compile(r"http://localhost:5173/projects/.+/boards/.+"))
    expect(page.get_by_text("To-Do")).to_be_visible()
    page.screenshot(path="verification_time_display.png")

    # Navigate to the time tracking page and click a task link
    page.get_by_role("link", name="Time Tracking").click()
    page.wait_for_url(re.compile(r"http://localhost:5173/projects/.+/time"))

    # Click the first task link with a board associated with it
    page.locator('a[href*="boards"]').first.click()

    # Wait for the board to load and take a screenshot to verify highlighting
    page.wait_for_url(re.compile(r"http://localhost:5173/projects/.+/boards/.+\?highlight=.+"))
    expect(page.locator('.ring-2.ring-primary')).to_be_visible()
    page.screenshot(path="verification_highlighting.png")


    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
