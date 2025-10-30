from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Login
            page.goto("http://localhost:5173/login")
            page.get_by_label("Email").fill("admin@test.com")
            page.get_by_label("Password").fill("123456")
            page.get_by_role("button", name="Login").click()
            page.wait_for_url("http://localhost:5173/projects")

            # Navigate to the first project, then the first board
            page.locator(".card a").first.click()
            page.wait_for_url("**/boards")
            page.locator(".card a").first.click()
            page.wait_for_url("**/board/**")

            # Open the first task card's modal
            page.locator(".card").first.click()

            # Open the assignee selection modal
            page.get_by_role("button", name="Assign Members").click()

            # Test fuzzy search
            page.get_by_placeholder("Search members...").fill("adm")

            # Select the admin user
            page.locator(".checkbox").first.check()

            # Take a screenshot of the assignee modal
            page.screenshot(path="jules-scratch/verification/assignee_selection_modal.png")

            # Confirm selection
            page.get_by_role("button", name="Confirm").click()

            # Wait for the modal to close and the card to update
            page.wait_for_selector(".avatar")

            # Take a screenshot of the card modal
            page.screenshot(path="jules-scratch/verification/card_modal_with_assignee.png")
            print("Screenshots taken successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error_screenshot.png")
            print("Error screenshot taken.")

        finally:
            browser.close()

if __name__ == "__main__":
    run()
