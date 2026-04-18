from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 1024})
    try:
        page.goto("http://localhost:3010")
        page.wait_for_timeout(1000)

        # Simulate some mouse movement to trigger ink
        page.mouse.move(500, 500)
        page.mouse.move(600, 500)
        page.mouse.move(700, 500)
        page.mouse.move(800, 500)
        page.wait_for_timeout(100)

        page.screenshot(path="D:/zerinn/Ai-project/复刻/zip/docs/check-revert.png", full_page=True)

        # Wait 1.5 seconds to see it disappear (now slower)
        page.wait_for_timeout(2000)
        page.screenshot(path="D:/zerinn/Ai-project/复刻/zip/docs/check-disappear.png", full_page=True)
    except Exception as e:
        print(f"Failed: {e}")
    finally:
        browser.close()
