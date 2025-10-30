import re
from playwright.sync_api import Page, expect
import time

def test_features(page: Page):
    # Log in
    page.goto("http://localhost:5173/login")
    page.get_by_label("Email").fill("admin@test.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()
    expect(page).to_have_url("http://localhost:5173/")

    # Navigate to the first project's board
    page.locator('.project-card').first.click()
    page.get_by_role("link", name="Boards").click()
    expect(page).to_have_url(re.compile(r"http://localhost:5173/projects/.*/boards"))
    page.locator(".board-card").first.click()
    expect(page).to_have_url(re.compile(r"http://localhost:5173/projects/.*/boards/.*"))

    time.sleep(2) # Wait for board to load

    # Find the first card
    first_card = page.locator(".kanban-card").first
    expect(first_card).to_be_visible()

    # 1. Verify Priority Button
    priority_button = first_card.get_by_role("button").nth(1)
    expect(priority_button).to_be_visible()

    # 2. Verify Context Menu
    context_menu_button = first_card.get_by_role("button").nth(2)
    expect(context_menu_button).to_be_visible()
    context_menu_button.click()

    # Check menu items
    expect(page.get_by_text("Edit")).to_be_visible()
    expect(page.get_by_text("Delete Card")).to_be_visible()
    expect(page.get_by_text("Mark as Completed")).to_be_visible()
    expect(page.get_by_text("Add Time Entry")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/card_context_menu.png")

    # Close the context menu by clicking the card
    first_card.click()

    # 3. Navigate to Time Tracking Page
    # Go back to project page
    page.get_by_role("link", name=re.compile("Project:")).click()

    page.get_by_role("link", name="Time Tracking").click()
    expect(page).to_have_url(re.compile(r"http://localhost:5173/projects/.*/time-tracking"))

    # Verify time tracking page elements
    expect(page.get_by_role("heading", name="Time Tracking")).to_be_visible()
    expect(page.get_by_role("button", name="Add Time Entry")).to_be_visible()

    page.screenshot(path="jules-scratch/verification/time_tracking_page.png")

    # 4. Open Time Entry Modal from Time Tracking Page
    page.get_by_role("button", name="Add Time Entry").click()
    expect(page.get_by_role("heading", name="Add Time Entry")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/time_entry_modal.png")
