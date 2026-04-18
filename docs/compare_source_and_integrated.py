from playwright.sync_api import sync_playwright

SOURCE_URL = 'http://127.0.0.1:3004/'
INTEGRATED_URL = 'http://127.0.0.1:3003/'
SOURCE_SHOT = r'D:\zerinn\Ai-project\复刻\zip\docs\source-lockscreen-check.png'
INTEGRATED_LOCKED_SHOT = r'D:\zerinn\Ai-project\复刻\zip\docs\integrated-locked-check.png'
INTEGRATED_UNLOCKED_SHOT = r'D:\zerinn\Ai-project\复刻\zip\docs\integrated-unlocked-check.png'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    source_page = browser.new_page(viewport={'width': 1440, 'height': 1024})
    source_page.goto(SOURCE_URL, wait_until='networkidle')
    source_page.screenshot(path=SOURCE_SHOT, full_page=True)

    integrated_page = browser.new_page(viewport={'width': 1440, 'height': 1024})
    integrated_page.goto(INTEGRATED_URL, wait_until='networkidle')
    integrated_page.screenshot(path=INTEGRATED_LOCKED_SHOT, full_page=True)

    for _ in range(6):
        integrated_page.mouse.wheel(0, 140)
        integrated_page.wait_for_timeout(120)

    integrated_page.wait_for_timeout(1400)
    integrated_page.wait_for_load_state('networkidle')
    integrated_page.screenshot(path=INTEGRATED_UNLOCKED_SHOT, full_page=True)

    print({
        'source': SOURCE_SHOT,
        'integrated_locked': INTEGRATED_LOCKED_SHOT,
        'integrated_unlocked': INTEGRATED_UNLOCKED_SHOT,
    })

    browser.close()
