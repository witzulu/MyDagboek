from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:5173/login")
    page.wait_for_timeout(2000)
    page.get_by_label("Email").fill("admin@dagboek.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to the projects page
    page.wait_for_url("http://localhost:5173/projects")

    # Create a new project
    page.get_by_role("button", name="New Project").click()
    page.get_by_label("Project Name").fill("Test Project")
    page.get_by_label("Description").fill("This is a test project.")
    page.get_by_role("button", name="Create Project").click()

    # Wait for the new project to appear and click on it
    page.get_by_text("Test Project").first.click()

    # Wait for navigation to the project dashboard and take a screenshot
    expect(page).to_have_url(lambda url: '/projects/' in url)
    page.screenshot(path="jules-scratch/verification/project_dashboard.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
