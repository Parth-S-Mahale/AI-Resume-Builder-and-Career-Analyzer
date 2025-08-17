from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
import os
import sqlite3
from live_crawler.job_api import router as job_api_router
from live_crawler.course_api import router as course_api_router
from live_crawler.intern_api import router as intern_api_router
from login_signup.user import router as user_router
from starlette.middleware.sessions import SessionMiddleware
#from automation_bot.connect_bot import router as linkedin_bot_router
from automation_bot.mail_bot import router as email_router
from jitsi.jitsi_router import router as jitsi_router
from dotenv import load_dotenv
load_dotenv()

# 1. Import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

from fetch_data import router as fetch_data_router
from fetch_file_data import router as fetch_file_data_router

app = FastAPI()

# 2. Define the allowed origins (your frontend's URL)
origins = [
    "http://localhost:5173",
]

# 3. Add the CORS middleware to your application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# --- Your existing code ---

# Include route to accept JSON input directly (e.g. from frontend form)
app.include_router(fetch_data_router)

# Include route to accept file upload input (PDF/DOCX resume file)
app.include_router(fetch_file_data_router)


#Drop Down Button FUnction
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_MAP = {
    "jobs": os.path.join(BASE_DIR, "crawler/jobs.db"),
    "internships": os.path.join(BASE_DIR, "crawler/intern.db"),
    "courses": os.path.join(BASE_DIR, "crawler/course.db")
}

@app.get("/dropdown")
def get_dropdown_keywords(source: str = Query(..., description="jobs | internships | courses")):
    source = source.lower()
    if source not in DB_MAP:
        raise HTTPException(status_code=400, detail="Invalid source. Use: jobs, internships, or courses.")
    
    db_path = DB_MAP[source]
    if not os.path.exists(db_path):
        raise HTTPException(status_code=404, detail=f"{source}.db not found.")

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(f"SELECT DISTINCT keyword FROM {source}")
        keywords = [row[0] for row in cursor.fetchall()]
        conn.close()
        return {"source": source, "keywords": keywords}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dropdown/data")
def get_data_by_keyword(source: str, keyword: str):
    source = source.lower()
    if source not in DB_MAP:
        raise HTTPException(status_code=400, detail="Invalid source.")

    db_path = DB_MAP[source]
    if not os.path.exists(db_path):
        raise HTTPException(status_code=404, detail=f"{source}.db not found.")

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {source} WHERE keyword = ?", (keyword,))
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"source": source, "keyword": keyword, "results": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get-details")
def fectch_head_from_db(source: str = Query(..., description="jobs | internships | courses")):
    source = source.lower()
    if source not in DB_MAP:
        raise HTTPException(status_code=400, detail="Invalid source.")

    db_path = DB_MAP[source]
    if not os.path.exists(db_path):
        raise HTTPException(status_code=404, detail=f"{source}.db not found.")
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(f"select * from {source} limit 10")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return{"results" : rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#-----------Indivisual keyword data scraping-------------
app.include_router(job_api_router)
app.include_router(course_api_router)
app.include_router(intern_api_router)
app.add_middleware(SessionMiddleware,secret_key=os.environ["SESSION_SECRET_KEY"])
app.include_router(user_router)
#app.include_router(linkedin_bot_router)
app.include_router(email_router)
app.include_router(jitsi_router, prefix="/api/jitsi")
