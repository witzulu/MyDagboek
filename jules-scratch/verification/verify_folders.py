from playwright.sync_api import Page, expect

def test_folder_functionality(page: Page):
    page.goto("http://localhost:5173/login")

    page.fill('input[name="email"]', 'admin@dagboek.com')
    page.fill('input[name="password"]', 'admin')
    page.click('button[type="submit"]')

    page.wait_for_url("http://localhost:5173/")

    page.click('text=Test Project')
    page.wait_for_url('http://localhost:5173/projects/667f68297092e076a5b29339')

    page.click('text=Notebook')
    page.wait_for_url('http://localhost:5173/projects/667f68297092e076a5b29339/notebook')

    # Click the "Add Folder" button
    page.locator('button:has(svg[class="lucide lucide-folder-plus"])').click()

    # Wait for the new folder to appear and verify it's visible
    new_folder = page.locator('text=New Folder')
    expect(new_folder).to_be_visible()

    page.screenshot(path="jules-scratch/verification/folder-verification.png")
