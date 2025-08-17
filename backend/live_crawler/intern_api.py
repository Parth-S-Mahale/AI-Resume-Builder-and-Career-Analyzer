from fastapi import APIRouter, Query, HTTPException
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import urllib.parse
import os

router = APIRouter()

os.environ['MOZ_HEADLESS'] = '1'

def init_driver():
    options = Options()
    options.headless = True
    options.add_argument("--headless")
    options.set_preference("dom.webnotifications.enabled", False)
    options.set_preference("permissions.default.image", 2)
    options.set_preference("media.volume_scale", "0.0")
    return webdriver.Firefox(options=options)

def clean_url(url):
    parsed = urllib.parse.urlparse(url)
    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))

def parse_internships(driver):
    soup = BeautifulSoup(driver.page_source, "html.parser")
    internships = []
    cards = soup.select("ul.jobs-search__results-list li")[:50]

    for card in cards:
        title_tag = card.select_one("h3.base-search-card__title")
        company_tag = card.select_one("h4.base-search-card__subtitle")
        location_tag = card.select_one("span.job-search-card__location")
        posted_tag = card.select_one("time.job-search-card__listdate")
        link_tag = card.select_one("a.base-card__full-link")

        raw_url = link_tag["href"] if link_tag else "N/A"
        cleaned_url = clean_url(raw_url) if raw_url != "N/A" else "N/A"

        internships.append({
            "title": title_tag.get_text(strip=True) if title_tag else "N/A",
            "company": company_tag.get_text(strip=True) if company_tag else "N/A",
            "location": location_tag.get_text(strip=True) if location_tag else "N/A",
            "posted": posted_tag.get_text(strip=True) if posted_tag else "N/A",
            "posted_datetime": posted_tag.get("datetime") if posted_tag else "N/A",
            "url": cleaned_url,
            "source": "LinkedIn"
        })

    return internships

@router.get("/live-internships")
def get_live_internships(role: str = Query(..., description="Internship role to search for")):
    encoded = urllib.parse.quote_plus(f"Internship in {role}")
    url = f"https://www.linkedin.com/jobs/search?keywords={encoded}&location=Pune%2C%20Maharashtra%2C%20India&geoId=114806696&position=1&pageNum=0"
    print(f"\n🔎 Live internship scraping for: {role}\nURL: {url}")

    driver = init_driver()
    driver.get(url)

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "ul.jobs-search__results-list li"))
        )
        internships = parse_internships(driver)
        return {"results": internships}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping error: {str(e)}")
    finally:
        driver.quit()

