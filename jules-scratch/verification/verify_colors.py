from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:5173/login")
            page.fill('input[name="email"]', "admin@dagboek.com")
            page.fill('input[name="password"]', "password")
            page.click('button[type="submit"]')
            page.wait_for_url("http://localhost:5173/")

            # Navigate to a project's changelog
            page.click('text=Test Project')
            page.wait_for_url("http://localhost:5173/projects/*")
            page.click('a[href*="/changelog"]')
            page.wait_for_url("http://localhost:5173/projects/*/changelog")

            # Wait for entries to load
            page.wait_for_selector('.card')

            page.screenshot(path="jules-scratch/verification/changelog_colors.png")
        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            browser.close()

run()
