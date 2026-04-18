from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    try:
        page.goto("http://localhost:3003")
        page.wait_for_timeout(2000)
        page.screenshot(path="D:/zerinn/Ai-project/复刻/zip/docs/white-screen-debug.png")
    except Exception as e:
        print(f"Failed: {e}")
    finally:
        browser.close()
