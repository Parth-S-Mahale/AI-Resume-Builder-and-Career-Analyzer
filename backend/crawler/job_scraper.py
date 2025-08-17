# dynamic_scraper_sqlite.py
from multiprocessing import Pool, cpu_count
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import sqlite3
import urllib.parse
import time
import os
from multiprocessing import Pool

# ---------- SQLite Setup ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "jobs.db")
# ---------- Selenium Setup ----------\
os.environ['MOZ_HEADLESS'] = '1'
def init_driver():
    options = Options()
    options.headless = True
    options.add_argument("--headless")
    options.set_preference("dom.webnotifications.enabled", False)  # disable popups
    options.set_preference("permissions.default.image", 2)         # disable images
    options.set_preference("media.volume_scale", "0.0")            # mute audio
    return webdriver.Firefox(options=options)

def clean_linkedin_url(url):
    parsed = urllib.parse.urlparse(url)
    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))

# ---------- Job Parsing ----------
def parse_jobs(driver, max_result=15):  #Limit per keyword
    #time.sleep(4)
    soup = BeautifulSoup(driver.page_source, "html.parser")
    jobs = []
    cards = soup.select("ul.jobs-search__results-list li")[:max_result]

    for card in cards:
        title_tag = card.select_one("h3.base-search-card__title")
        company_tag = card.select_one("h4.base-search-card__subtitle")
        location_tag = card.select_one("span.job-search-card__location")
        posted_tag = card.select_one("time.job-search-card__listdate")
        link_tag = card.select_one("a.base-card__full-link")
        
        raw_url = link_tag["href"] if link_tag else "N/A"
        cleaned_url = clean_linkedin_url(raw_url) if raw_url != "N/A" else "N/A"

        job = {
            "title": title_tag.get_text(strip=True) if title_tag else "N/A",
            "company": company_tag.get_text(strip=True) if company_tag else "N/A",
            "location": location_tag.get_text(strip=True) if location_tag else "N/A",
            "posted": posted_tag.get_text(strip=True) if posted_tag else "N/A",
            "posted_datetime": posted_tag.get("datetime") if posted_tag else "N/A",
            "url":  cleaned_url,
            "source": "LinkedIn"
        }
        jobs.append(job)

    return jobs

# ---------- Save to DB ----------
def save_jobs_to_sqlite(jobs, keyword):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    for job in jobs:
        #Insert
        cursor.execute("""
        INSERT INTO jobs (title, company, location, posted, posted_datetime, url, keyword, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            job["title"],
            job["company"],
            job["location"],
            job["posted"],
            job["posted_datetime"],
            job["url"],
            keyword,
            job["source"]
        ))
    conn.commit()
    conn.close()

def run_job_scraper_from_list(job_roles):
    # ✅ Wipe and recreate the DB ONCE
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        company TEXT,
        location TEXT,
        posted TEXT,
        posted_datetime TEXT,
        url TEXT,
        keyword TEXT,
        source TEXT
    )
    """)
    conn.commit()
    conn.close()
    print(f"Launching parallel scraping for {len(job_roles)} roles...\n")

    with Pool(processes=20) as pool:
        pool.map(run_dynamic_scraper, [r for r in job_roles if r.strip()])
# ---------- Run Dynamic Crawler ----------
def run_dynamic_scraper(role):
    encoded = urllib.parse.quote_plus(role)
    url = f"https://www.linkedin.com/jobs/search?keywords={encoded}&location=Pune%2C%2BMaharashtra%2C%2BIndia&geoId=114806696"
    print(f"\n🔍 Searching for '{role}' jobs...\nURL: {url}")

    driver = init_driver()
    driver.get(url)

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "ul.jobs-search__results-list li"))
        )
        jobs = parse_jobs(driver)
        save_jobs_to_sqlite(jobs, role)
        print(f"✅ Saved {len(jobs)} jobs for '{role}'")
    except Exception as e:
        print(f"❌ Error occurred: {e}")
    finally:
        driver.quit()
        print("\n🚀 Dynamic crawling complete.")

# ---------- Run ----------
if __name__ == "__main__":
    run_dynamic_scraper()

