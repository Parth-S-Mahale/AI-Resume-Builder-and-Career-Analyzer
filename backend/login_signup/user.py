import os
import sqlite3
from fastapi import APIRouter, HTTPException, Form, Request, Depends,UploadFile, File
from fastapi.responses import RedirectResponse, FileResponse,JSONResponse
from passlib.context import CryptContext
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from datetime import datetime
from datetime import datetime

# Load env vars
load_dotenv()
db_dir = os.path.join(os.path.dirname(__file__), "users")
os.makedirs(db_dir, exist_ok=True)
DB_FILE = os.path.join(db_dir, "users.db")
router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")




# ---------- Register User ----------
@router.post("/register")
def register_user(request: Request,email: str = Form(...), password: str = Form(...)):
    hashed_pw = pwd_context.hash(password)
    conn = sqlite3.connect(DB_FILE) 
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed_pw))
        conn.commit()

        # Immediately fetch user_id after registration
        cursor.execute("SELECT id FROM users WHERE email=?", (email,))
        user_id = cursor.fetchone()[0]
        request.session["email"] = email
        request.session["user_id"] = user_id


        return {"message": "✅ Registered successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="❌ Email already exists")
    finally:
        conn.close()

# ---------- Login User ----------
@router.post("/login")
def login_user(request: Request, email: str = Form(...), password: str = Form(...)):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT password, id FROM users WHERE email=?", (email,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="❌ Invalid credentials")

    hashed_password = row[0]
    user_id = row[1]

    if not pwd_context.verify(password, hashed_password):
        raise HTTPException(status_code=401, detail="❌ Invalid credentials")

    request.session["email"] = email
    request.session["user_id"] = user_id

    return {"message": "✅ Login successful"}

# ---------- OAuth Setup ----------
oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/login/google")
async def login_google(request: Request):
    redirect_uri = request.url_for('auth_google')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/auth/google")
async def auth_google(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = await oauth.google.parse_id_token(request, token)
    email = user_info.get("email")

    # Insert into DB if not present
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email=?", (email,))
    existing = cursor.fetchone()

    if not existing:
        cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, ""))
        conn.commit()

    conn.close()

    return {"message": "✅ Google Login successful", "email": email}
#---------Logout---------
@router.post("/logout")
def logout_user(request: Request):
    if "email" in request.session:
        request.session.clear()
        return {"message": "✅ Logged out successfully"}
    else:
        return JSONResponse(status_code=400, content={"message": "❌ User not logged in"})

#-----------Remove Account--------
def delete_account(email: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # 🔍 Get user row
    cursor.execute("SELECT id, pdf_path FROM users WHERE email = ?", (email,))
    result = cursor.fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="User not found.")

    user_id, pdf_path = result

    # 🗑 Delete PDF if exists
    if pdf_path and os.path.exists(os.path.join(BASE_DIR, pdf_path)):
        os.remove(os.path.join(BASE_DIR, pdf_path))

    # ❌ Delete user row
    cursor.execute("DELETE FROM users WHERE email = ?", (email,))
    conn.commit()
    conn.close()

    return {"message": "Account and resume deleted successfully.", "user_id": user_id}

#API to remove user
@router.delete("/delete-account")
def delete_current_account(email: str = Form(...)):
    return delete_account(email)
