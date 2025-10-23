import re
from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:5173/login")
    time.sleep(5) # Give the page time to load
    page.get_by_label("Email").fill("admin@dagboek.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the projects page and click the first project
    page.wait_for_url("http://localhost:5173/projects")
    page.locator(".project-card").first.click()

    # Navigate to the notebook
    page.wait_for_url(re.compile(r"http://localhost:5173/projects/.*"))
    page.get_by_role("link", name="Go to Notebook").click()

    # Create a new note
    page.wait_for_url(re.compile(r"http://localhost:5173/projects/.*/notebook"))
    page.get_by_role("button", name="New Note").click()

    # Wait for the new note to appear and take a screenshot
    expect(page.get_by_text("New Note")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/notebook_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
