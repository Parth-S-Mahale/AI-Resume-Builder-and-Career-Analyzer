from fastapi import APIRouter, Query, HTTPException
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from bs4 import BeautifulSoup
import urllib.parse
import os
import time

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

def scrape_coursera(query):
    driver = init_driver()
    search_url = f"https://www.coursera.org/search?query={urllib.parse.quote_plus(query)}"
    print(f"📚 Scraping Coursera for: {query}")
    driver.get(search_url)
    time.sleep(5)  # Allow page load

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

            courses.append({
                'title': title,
                'provider': provider,
                'link': link
            })

    return courses

@router.get("/live-courses")
def get_live_courses(topic: str = Query(..., description="Course topic to search for")):
    try:
        results = scrape_coursera(topic)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping error: {str(e)}")

