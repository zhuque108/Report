from playwright.sync_api import sync_playwright
import os

output_dir = r"C:\Users\Administrator\Desktop\code\Project\Hreport"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    # Step 1: Navigate to home page and take screenshot
    print("Step 1: Navigating to home page http://localhost:5000 ...")
    page.goto("http://localhost:5000", timeout=30000)
    page.wait_for_load_state("networkidle")

    screenshot1 = os.path.join(output_dir, "screenshot_home.png")
    page.screenshot(path=screenshot1, full_page=True)
    print(f"Home page screenshot saved to: {screenshot1}")

    # Check for the batch import button
    batch_buttons = page.locator('text=批量导入导出').all()
    print(f"Found {len(batch_buttons)} elements matching '批量导入导出'")

    # Also check broader patterns
    all_buttons = page.locator("button, a").all()
    print(f"Total buttons/links on home page: {len(all_buttons)}")
    for btn in all_buttons[:20]:
        text = btn.inner_text().strip()
        if text:
            print(f"  - Button/Link: '{text}'")

    # Step 2: Navigate to batch page and take screenshot
    print("\nStep 2: Navigating to batch page http://localhost:5000/batch ...")
    page.goto("http://localhost:5000/batch", timeout=30000)
    page.wait_for_load_state("networkidle")

    screenshot2 = os.path.join(output_dir, "screenshot_batch.png")
    page.screenshot(path=screenshot2, full_page=True)
    print(f"Batch page screenshot saved to: {screenshot2}")

    # Inspect the batch page content
    page_title = page.title()
    print(f"Batch page title: '{page_title}'")

    # Check for key elements on the batch page
    headings = page.locator("h1, h2, h3").all()
    print(f"Headings on batch page: {len(headings)}")
    for h in headings[:10]:
        text = h.inner_text().strip()
        if text:
            print(f"  - Heading: '{text}'")

    all_buttons_batch = page.locator("button, a").all()
    print(f"Total buttons/links on batch page: {len(all_buttons_batch)}")
    for btn in all_buttons_batch[:20]:
        text = btn.inner_text().strip()
        if text:
            print(f"  - Button/Link: '{text}'")

    # Check for file upload inputs
    file_inputs = page.locator("input[type='file']").all()
    print(f"File upload inputs: {len(file_inputs)}")

    browser.close()
    print("\nDone! Both screenshots captured successfully.")
