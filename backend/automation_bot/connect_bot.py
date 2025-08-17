from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.firefox_profile import FirefoxProfile
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import urllib.parse
import time

def connect_to_first_person(keyword):
    print(f"\n🔍 Searching for: {keyword}")
    encoded_keyword = urllib.parse.quote_plus(keyword)
    url = f"https://www.linkedin.com/search/results/people/?keywords={encoded_keyword}&origin=SWITCH_SEARCH_VERTICAL"

    # Update with your actual Firefox profile path
    profile_path = "/home/blue/.mozilla/firefox/6952aln0.default-release"
    profile = FirefoxProfile(profile_path)

    options = Options()
    options.profile = profile
    options.headless = False  # Run in non-headless to see what's happening

    print("🚀 Launching Firefox with user profile...")
    driver = webdriver.Firefox(options=options)

    try:
        print("🌐 Navigating to LinkedIn search page...")
        driver.get(url)

        print("⏳ Waiting for search results to load...")
        ul_locator = (By.CSS_SELECTOR, 'ul[role="list"].reusable-search__entity-results-list')
        WebDriverWait(driver, 10).until(EC.presence_of_element_located(ul_locator))

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

    try:
        print("⏳ Waiting for any 'Connect' buttons to appear...")
        
        # Wait for at least one button to appear (can be Connect, Message, etc.)
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, '//button'))
        )
        print("✅ Found some buttons on page, now filtering 'Connect' buttons...")

        buttons = driver.find_elements(By.XPATH, '//button[span[text()[normalize-space()="Connect"]]]')
        print(f"🔎 Total 'Connect' buttons found: {len(buttons)}")

        if not buttons:
            print("❌ No 'Connect' button matched XPath after loading.")
            return {"status": "error", "message": "No Connect button found."}

        for index, btn in enumerate(buttons):
            try:
                print(f"➡️ Trying button #{index + 1}")
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", btn)
                time.sleep(1)

                if btn.is_displayed() and btn.is_enabled():
                    print("✅ Clicking 'Connect' button now...")
                    btn.click()
                    time.sleep(2)
                    return {"status": "success", "message": "Connect button clicked."}
                else:
                    print("⚠️ Button not clickable.")
            except Exception as e:
                print(f"⚠️ Exception while trying button #{index + 1}: {e}")
                continue

        print("❌ All buttons tried, none clicked.")
        return {"status": "error", "message": "No Connect button was clickable."}

    except Exception as e:
        print(f"💥 Unexpected exception during Connect button search: {e}")
    return {"status": "error", "message": str(e)}


    finally:
        time.sleep(3)
        driver.quit()
        print("🧹 Browser closed.")

# Test from terminal
if __name__ == "__main__":
    connect_to_first_person("data scientist")

