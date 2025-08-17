# course_scraper.py
from multiprocessing import Pool
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from bs4 import BeautifulSoup
import sqlite3
import time
import urllib.parse
import os

# ---------- SQLite Setup ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "course.db")

# ---------- Headless Setup ----------
os.environ['MOZ_HEADLESS'] = '1'

def init_driver():
    options = Options()
    options.headless = True
    options.add_argument("--headless")
    options.set_preference("dom.webnotifications.enabled", False)
    options.set_preference("permissions.default.image", 2)
    options.set_preference("media.volume_scale", "0.0")
    return webdriver.Firefox(options=options)

# ---------- Scraping Logic ----------
def scrape_courses_for_keyword(keyword):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    encoded = urllib.parse.quote_plus(keyword)
    url = f"https://www.coursera.org/search?query={encoded}"
    print(f"\n📚 Scraping Coursera for: {keyword}\nURL: {url}")

    driver = init_driver()
    driver.get(url)
#    time.sleep(5)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    driver.quit()

    courses = []
    for li in soup.find_all('li'):
        a_tag = li.find('a', href=True)
        if a_tag and any(x in a_tag['href'] for x in ['/learn/', '/specializations/', '/professional-certificates/']):
            title_tag = a_tag.find('h3')
            if not title_tag:
                continue
            title = title_tag.get_text(strip=True)
            link = "https://www.coursera.org" + a_tag['href']
            provider_tag = li.find('p', class_='cds-ProductCard-partnerNames css-vac8rf')
            provider = provider_tag.get_text(strip=True) if provider_tag else 'Unknown'

            cursor.execute("""
                INSERT OR IGNORE INTO courses (title, provider, link, keyword)
                VALUES (?, ?, ?, ?)
            """, (title, provider, link, keyword))

    conn.commit()
    conn.close()
    print(f"✅ Saved courses for '{keyword}'")

# ---------- Run From List ----------
def run_course_scraper_from_list(cert_list):
    # Wipe and create DB
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            provider TEXT,
            link TEXT UNIQUE,
            keyword TEXT
        )
    ''')
    conn.commit()
    conn.close()

    print(f"Launching parallel course scraping for {len(cert_list)} keywords...\n")
    with Pool(processes=5) as pool:
        pool.map(scrape_courses_for_keyword, [k for k in cert_list if k.strip()])

# ---------- Debug CLI ----------
if __name__ == "__main__":
    run_course_scraper_from_list(["AWS Developer", "Data Science", "Scrum Master"])

