import re
import time
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Login
        page.goto("http://localhost:5173/login")
        page.get_by_label("Email").fill("admin@dagboek.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()
        expect(page).to_have_url(re.compile(".*projects"))
        print("Login successful.")

        # Navigate to the first project's board
        page.locator(".project-card").first.click()
        expect(page).to_have_url(re.compile(".*\/projects\/.*"))
        page.get_by_role("link", name="Boards").click()
        expect(page).to_have_url(re.compile(".*\/boards"))
        print("Navigated to boards page.")

        # Open the context menu on the first card
        page.locator(".card-menu-btn").first.click()
        print("Opened card context menu.")

        # Check for the new "Add Time Entry" option
        add_time_entry_option = page.get_by_text("Add Time Entry")
        expect(add_time_entry_option).to_be_visible()
        print("'Add Time Entry' option is visible in the context menu.")

        # Click the "Add Time Entry" option to open the modal
        add_time_entry_option.click()
        expect(page.get_by_role("heading", name="Add Time Entry")).to_be_visible()
        print("Time Entry modal opened successfully.")

        # Fill out and submit the modal form
        page.get_by_label("Description").fill("Test time entry from Playwright")
        page.get_by_label("Hours").fill("1.5")
        page.get_by_role("button", name="Save").click()

        # Wait for the success toast and for the modal to close
        expect(page.get_by_text("Time entry added successfully")).to_be_visible()
        expect(page.get_by_role("heading", name="Add Time Entry")).not_to_be_visible()
        print("Time entry added and modal closed.")

        # Navigate to the project's time tracking page to verify the entry
        page.get_by_role("link", name="Time Tracking").click()
        expect(page).to_have_url(re.compile(".*\/time-tracking"))
        print("Navigated to Time Tracking page.")

        # Verify the new entry is in the list
        expect(page.get_by_text("Test time entry from Playwright")).to_be_visible()
        expect(page.locator("tbody tr")).to_have_count(1)
        print("Time entry successfully verified on the Time Tracking page.")

        print("✅ Verification successful!")

    except Exception as e:
        print(f"❌ Verification failed: {e}")
        page.screenshot(path="jules-scratch/error_screenshot.png")
        print("Screenshot saved to jules-scratch/error_screenshot.png")

        # Print console logs for debugging
        console_logs = page.evaluate("() => window.consoleLogs")
        if console_logs:
            print("\n--- Browser Console Logs ---")
            for log in console_logs:
                print(f"[{log.type}] {log.text}")
            print("--------------------------")

    finally:
        context.close()
        browser.close()

# Inject a script to capture console logs
def capture_console_logs(page):
    page.evaluate("""
        window.consoleLogs = [];
        const originalConsole = window.console;
        window.console = {
            ...originalConsole,
            log: (...args) => { window.consoleLogs.push({ type: 'log', text: args.join(' ') }); originalConsole.log(...args); },
            error: (...args) => { window.consoleLogs.push({ type: 'error', text: args.join(' ') }); originalConsole.error(...args); },
            warn: (...args) => { window.consoleLogs.push({ type: 'warn', text: args.join(' ') }); originalConsole.warn(...args); },
        };
    """)

with sync_playwright() as p:
    run_verification(p)
