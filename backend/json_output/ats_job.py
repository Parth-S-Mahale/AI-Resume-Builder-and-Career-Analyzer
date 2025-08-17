import os
import json
import re
import ast
from typing import List, Dict
import fitz

# AI and ML imports
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# --- Configuration ---
API_KEY = os.environ.get("GOOGLE_API_KEY", "AIzaSyBz8BpqNokZLzznpuV2-sYT3f_uPDEh89c")
genai.configure(api_key=API_KEY)

# --- Initialize Models ---
print("Loading models...")
try:
    semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
    genai_model = genai.GenerativeModel('models/gemini-2.5-flash')
    generation_config = genai.GenerationConfig(temperature=0)
    print("✅ Models loaded successfully.")
except Exception as e:
    print(f"🛑 Error loading models: {e}")
    exit()

# --- Core Logic Functions ---

def scale_score(score: float, original_min: float = 40.0, original_max: float = 85.0, new_min: float = 60.0, new_max: float = 100.0) -> float:
    if score < original_min:
        return new_min - 8
    if score >= original_max:
        return new_max
    return new_min + ((score - original_min) * (new_max - new_min) / (original_max - original_min))

def extract_jd_details(jd_text: str) -> Dict:
    prompt = f"""
    Analyze the following job description and extract two components:
    1. "skills": A Python list of the most important technical skills, tools, and platforms.
    2. "responsibilities": A single string summarizing the key responsibilities and daily tasks of the role.
    Return the result ONLY as a JSON object.
    Job Description: --- {jd_text} ---
    """
    try:
        response = genai_model.generate_content(prompt, generation_config=generation_config)
        match = re.search(r"\{.*\}", response.text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        print(f"Error extracting JD details with GenAI: {e}")
    return {"skills": [], "responsibilities": ""}

def parse_resume_with_genai(resume_text: str) -> Dict:
    prompt = f"""
    Parse the following resume text into a structured JSON object with keys "skills" (as a list of strings) and "experience" (as a single string).
    Return ONLY the JSON object.
    Resume Text: --- {resume_text} ---
    """
    try:
        response = genai_model.generate_content(prompt, generation_config=generation_config)
        match = re.search(r"\{.*\}", response.text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        print(f"Error parsing resume with GenAI: {e}")
    return {}

def calculate_semantic_score(text1: str, text2: str) -> float:
    if not text1 or not text2:
        return 0.0
    embedding1 = semantic_model.encode(text1)
    embedding2 = semantic_model.encode(text2)
    score = cosine_similarity([embedding1], [embedding2])[0][0]
    return score * 100

def calculate_keyword_score(resume_skills: List[str], jd_keywords: List[str]) -> float:
    if not jd_keywords:
        return 0.0
    resume_skills_lower = [skill.lower() for skill in resume_skills]
    jd_keywords_lower = [keyword.lower() for keyword in jd_keywords]
    common_keywords = set(resume_skills_lower) & set(jd_keywords_lower)
    return (len(common_keywords) / len(jd_keywords)) * 100

def find_missing_skills(resume_skills: List[str], jd_keywords: List[str]) -> List[str]:
    resume_skills_lower = [skill.lower() for skill in resume_skills]
    jd_keywords_lower = [keyword.lower() for keyword in jd_keywords]
    return list(set(jd_keywords_lower) - set(resume_skills_lower))

def find_matched_skills(resume_skills: List[str], jd_keywords: List[str]) -> List[str]:
    """Finds the keywords present in both the resume and the job description."""
    resume_skills_lower = [skill.lower() for skill in resume_skills]
    jd_keywords_lower = [keyword.lower() for keyword in jd_keywords]
    return list(set(resume_skills_lower) & set(jd_keywords_lower))


# --- ✅ Callable Function for Backend Integration ---

def analyze_resume_with_job(resume_path: str, job_description: str) -> Dict:
    try:
        # Read PDF file using PyMuPDF (fitz)
        with fitz.open(resume_path) as doc:
            resume_text = "".join(page.get_text() for page in doc)
    except Exception as e:
        return {"error": f"Failed to read resume: {e}"}

    structured_resume = parse_resume_with_genai(resume_text)
    jd_details = extract_jd_details(job_description)

    if not structured_resume or not jd_details.get("skills"):
        return {"error": "AI processing failed. Resume or JD details could not be extracted."}

    resume_skills = structured_resume.get('skills', [])
    jd_keywords = jd_details.get('skills', [])
    raw_keyword_score = calculate_keyword_score(resume_skills, jd_keywords)
    scaled_keyword_score = scale_score(raw_keyword_score, original_min=50, new_min=60)

    resume_experience = structured_resume.get('experience', '')
    jd_responsibilities = jd_details.get('responsibilities', '')
    raw_experience_score = calculate_semantic_score(resume_experience, jd_responsibilities)
    scaled_experience_score = scale_score(raw_experience_score)

    raw_general_score = calculate_semantic_score(resume_text, job_description)
    scaled_general_score = scale_score(raw_general_score)

    final_score = (0.3 * scaled_keyword_score) + (0.1 * scaled_experience_score) + (0.6 * scaled_general_score)
    final_score = min(final_score, 100.0)

    missing_skills = find_missing_skills(resume_skills, jd_keywords)
    matched_skills = find_matched_skills(resume_skills, jd_keywords)

    return {
        "keyword_score": {
            "raw": round(float(raw_keyword_score), 2),
            "scaled": round(float(scaled_keyword_score), 2)
        },
        "experience_score": {
            "raw": round(float(raw_experience_score), 2),
            "scaled": round(float(scaled_experience_score), 2)
        },
        "general_score": {
            "raw": round(float(raw_general_score), 2),
            "scaled": round(float(scaled_general_score), 2)
        },
        "final_score": round(float(final_score), 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }
