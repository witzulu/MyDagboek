from playwright.sync_api import sync_playwright, TimeoutError

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Listen for console messages
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    try:
        # Login
        print("Navigating to login page...")
        page.goto("http://localhost:5173/login")
        print("Waiting for email field...")
        page.get_by_label("Email").wait_for(timeout=5000)
        page.get_by_label("Email").fill("admin@test.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()
        page.wait_for_url("http://localhost:5173/")

        # Go to settings
        page.goto("http://localhost:5173/settings")

        # Open theme switcher and take screenshot
        page.get_by_role("button", name="Theme").click()
        page.screenshot(path="jules-scratch/verification/theme_switcher.png")

        # Change theme to Dracula
        page.get_by_role("button", name="Dracula").click()

        # Take screenshot of the new theme
        page.screenshot(path="jules-scratch/verification/dracula_theme.png")

    except TimeoutError:
        print("Timeout error during login, taking a screenshot.")
        page.screenshot(path="jules-scratch/verification/login_error.png")
        raise

    finally:
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)