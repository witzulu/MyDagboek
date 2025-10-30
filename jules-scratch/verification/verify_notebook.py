from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Listen for console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text()}"))

    try:
        # 1. Login
        page.goto("http://localhost:5174/login")
        page.get_by_label("Email").fill("admin@dagboek.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()
        page.wait_for_url("http://localhost:5174/projects")

        # 2. Navigate to a project's notebook
        page.locator(".card-title:has-text('My First Project')").click()
        page.wait_for_url("http://localhost:5174/projects/*")
        page.get_by_role("link", name="Notebook").click()
        page.wait_for_url("http://localhost:5174/projects/*/notebook")

        # 3. Verify Search and Note Interaction
        search_bar = page.get_by_placeholder("Search notes...")
        search_bar.fill("Progress")

        page.get_by_text("Progress report").click()

        # 4. Verify Drawing Canvas
        page.get_by_text("Drawing").click()

        # 5. Take Screenshot
        page.screenshot(path="jules-scratch/verification/notebook_verification.png")
        print("Screenshot saved to jules-scratch/verification/notebook_verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
