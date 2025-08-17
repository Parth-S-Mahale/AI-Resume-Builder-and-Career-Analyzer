from fastapi import APIRouter, UploadFile, Form, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import yagmail
import os
import shutil
import tempfile
from datetime import datetime

router = APIRouter()
from fastapi import APIRouter, UploadFile, Form, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import yagmail
import os
import shutil
import tempfile
from datetime import datetime

router = APIRouter()

@router.post("/send-emails")
async def send_emails(
    user_email: str = Form(...),
    user_app_password: str = Form(...),
    cover_letter: str = Form(...),
    upload_pdf_resume: UploadFile = File(...)
):
    try:
        # Use local HR_data.xlsx (already in backend dir)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        hr_excel_path = os.path.join(script_dir, "HR_data.xlsx")
        if not os.path.exists(hr_excel_path):
            raise HTTPException(status_code=500, detail="HR_data.xlsx not found in backend directory")

        # Read HR data
        df = pd.read_excel(hr_excel_path)
        required_cols = {"Name", "Email", "Title", "Company"}
        if not required_cols.issubset(df.columns):
            raise HTTPException(status_code=400, detail="HR_data.xlsx must contain columns: Name, Email, Title, Company")

        # Extract top 3 HR entries
        hr_list = df[["Name", "Email", "Title", "Company"]].dropna().head(3).to_dict(orient="records")

        # Save uploaded resume to temp dir
        with tempfile.TemporaryDirectory() as temp_dir:
            resume_path = os.path.join(temp_dir, upload_pdf_resume.filename)
            with open(resume_path, "wb") as f:
                shutil.copyfileobj(upload_pdf_resume.file, f)

            # Initialize email client
            yag = yagmail.SMTP(user_email, user_app_password)
            result_log = []

            # Send emails
            for hr in hr_list:
                recipient = hr["Email"]
                name = hr["Name"]
                title = hr["Title"]
                company = hr["Company"]

                yag.send(
                    to=recipient,
                    subject=f"Application for a role at {company}",
                    contents=f"Dear {name},\n\n{cover_letter}\n\nBest regards,\n{user_email}",
                    attachments=resume_path
                )

                result_log.append({
                    "email_sent_to": recipient,
                    "hr_name": name,
                    "hr_title": title,
                    "company": company,
                    "time_sent": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })

        return JSONResponse(content={
            "status": "success",
            "details": result_log
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

