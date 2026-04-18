from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:3001/'
SCREENSHOT = r'D:\zerinn\Ai-project\复刻\zip\docs\lockscreen-unlock-check.png'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1024})
    page.goto(URL, wait_until='networkidle')

    initial = {
        'scroll_hint': page.locator('text=SCROLL TO UNLOCK').count(),
        'about_project': page.locator('text=关于项目').count(),
        'building': page.locator('text=BUILDING').count(),
    }

    for _ in range(6):
        page.mouse.wheel(0, 140)
        page.wait_for_timeout(120)

    page.wait_for_timeout(1400)
    page.wait_for_load_state('networkidle')

    unlocked = {
        'scroll_hint': page.locator('text=SCROLL TO UNLOCK').count(),
        'about_project': page.locator('text=关于项目').count(),
        'desktop_title': page.locator('text=AI背包展示').count(),
    }

    page.screenshot(path=SCREENSHOT, full_page=True)

    print({'initial': initial, 'unlocked': unlocked, 'screenshot': SCREENSHOT})
    browser.close()
