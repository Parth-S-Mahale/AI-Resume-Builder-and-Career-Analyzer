from fastapi import APIRouter,UploadFile, File, HTTPException,Form
import os
from PyPDF2 import PdfReader
from docx2pdf import convert
from json_output.ats import run_ats_pipeline
from segregate import extract_recommendation_lists
import json

from json_output.ats_job import analyze_resume_with_job
from json_output.atsJD import run_ats_pipeline_with_jd
from multiprocessing import Process
from crawler.course_scraper import run_course_scraper_from_list
from crawler.job_scraper import run_job_scraper_from_list
from crawler.intern_scraper import run_internship_scraper

router = APIRouter()


# Constants
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "json_output")
PDF_FILENAME = "user_resume.pdf"
PDF_OUTPUT_PATH = os.path.join(UPLOAD_DIR, PDF_FILENAME)


def convert_docx_to_pdf(docx_path, output_dir):
    try:
        convert(docx_path, output_dir)
        # Always rename to user_resume.pdf
        filename_wo_ext = os.path.splitext(os.path.basename(docx_path))[0]
        converted_path = os.path.join(output_dir, f"{filename_wo_ext}.pdf")
        os.rename(converted_path, PDF_OUTPUT_PATH)
    except Exception as e:
        raise RuntimeError(f"Failed to convert DOCX to PDF: {str(e)}")


def is_text_selectable(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = "".join(page.extract_text() or "" for page in reader.pages)
        return bool(text.strip())
    except Exception:
        return False

@router.post("/upload-resume")
async def process_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        file_ext = file.filename.split(".")[-1].lower()
        input_dir = os.path.join(os.path.dirname(__file__), "json_output")
        os.makedirs(input_dir, exist_ok=True)

        # Save uploaded file
        temp_path = os.path.join(input_dir, f"temp_resume.{file_ext}")
        with open(temp_path, "wb") as f:
            f.write(contents)

        # Convert DOCX to PDF if needed 
        if file_ext == "docx":
            pdf_path = convert_docx_to_pdf(temp_path, input_dir)
        elif file_ext == "pdf":
            pdf_path = os.path.join(input_dir, "user_resume.pdf")
            with open(pdf_path, "wb") as f:
                f.write(contents)
        else:
            raise ValueError("Unsupported file type. Only PDF or DOCX allowed.")

        # Check selectable text
        if not is_text_selectable(pdf_path):
            raise ValueError("Document not readable: selectable text not found.")

        # Run ATS model
        ats_output= run_ats_pipeline(pdf_path)

        # ✅ Return the output from ats_analysis.json + segregated data
        ats_json_path = os.path.join(input_dir, "ats_analysis.json")
        if os.path.exists(ats_json_path):
            with open(ats_json_path, "r", encoding="utf-8") as f:
                ats_output = json.load(f)

            # ⬇️ Extract roles and certifications
            job_roles, certifications = extract_recommendation_lists(ats_output)
            #scrape-multi processing
            run_all_scrapers_sync(job_roles, certifications)
            return {"ats_analysis": ats_output}

        else:
            raise FileNotFoundError("ATS analysis output not found.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-resume-jobmatch")
async def upload_resume_with_job(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Check file extension
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(status_code=400, detail="❌ Only PDF or DOCX files are supported")

    # Save uploaded file temporarily
    saved_path = os.path.join(UPLOAD_DIR, "temp_resume.pdf")
    with open(saved_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        # ✅ Get response from OLD ATS (resume-only)
        ats_result = analyze_resume_with_job(saved_path, job_description)

        # ✅ Get response from NEW ATS + Job Description
        ats_jd_result = run_ats_pipeline_with_jd(saved_path, job_description)

        # ✅ Return both
        return {
            "ats_analysis": ats_result,
            "ats_job_match": ats_jd_result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Error during ATS job matching: {str(e)}")

    finally:
        if os.path.exists(saved_path):
            os.remove(saved_path)



from multiprocessing import Process
def run_all_scrapers_sync(job_roles, certifications):
    p1 = Process(target=run_course_scraper_from_list, args=(certifications,))
    p2 = Process(target=run_job_scraper_from_list, args=(job_roles,))
    p3 = Process(target=run_internship_scraper, args=(job_roles,))

    p1.start()
    p2.start()
    p3.start()

    # block json until scraper is finished
    p1.join()
    p2.join()
    p3.join()
