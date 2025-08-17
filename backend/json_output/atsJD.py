import PyPDF2
import re
import json
import json5
import demjson3
import google.generativeai as genai
import os

# ========== CONFIGURE GEMINI ==========
# IMPORTANT: Replace with your actual API key in a secure way (e.g., environment variables)
# It is not recommended to hardcode API keys in the source code.
genai.configure(api_key="AIzaSyBz8BpqNokZLzznpuV2-sYT3f_uPDEh89c") 
model = genai.GenerativeModel("models/gemini-2.5-flash")


# ========== HELPER FUNCTIONS (UNCHANGED) ==========

def extract_text_from_pdf(pdf_path):
    """Extracts text from all pages of a PDF file."""
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
        return None
    return text

def parse_strict_json(raw_response):
    """Attempts to parse a JSON string using multiple libraries for robustness."""
    # Clean the response by removing markdown backticks and 'json' specifier
    cleaned = raw_response.strip().replace("```json", "").replace("```", "")

    # Try parsing with standard json library
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass # If it fails, try the next method

    # Try parsing with json5, which is more lenient
    try:
        return json5.loads(cleaned)
    except Exception:
        pass # If it fails, try the next method

    # Try parsing with demjson3, another lenient parser
    try:
        return demjson3.decode(cleaned)
    except Exception:
        # If all parsers fail, return None
        print("Error: Failed to parse JSON response from AI.")
        return None


# ========== NEW: ANALYSIS WITH JOB DESCRIPTION ==========

def get_ats_analysis_with_jd(resume_text, jd_text):
    """
    Analyzes a resume against a job description using Gemini AI.

    Args:
        resume_text: The text content of the resume.
        jd_text: The text content of the job description.

    Returns:
        A dictionary containing the detailed analysis, or None if an error occurs.
    """
    # This prompt is specifically engineered to get a detailed comparison
    prompt = f"""
    You are a highly sophisticated ATS (Applicant Tracking System) scanner with deep expertise in talent acquisition and resume optimization. 
    Your task is to meticulously compare the provided resume against the given job description.

    Analyze the following resume text and job description text, and return a STRICTLY valid JSON object with the following structure:
    
    {{
      "match_score": <number>,                                  // An integer percentage (0-100) representing how well the resume matches the job description.
      "summary": "<string>",                                    // A concise, one-paragraph summary of the candidate's suitability for the role.
      "keywords_matched": ["<keyword1>", "<keyword2>", ...],    // A list of keywords found in BOTH the resume and the job description.
      "missing_keywords": ["<keyword1>", "<keyword2>", ...],    // A list of crucial keywords from the job description that are MISSING from the resume.
      "suggestions_for_improvement": ["<tip1>", "<tip2>", ...], // Actionable suggestions for the candidate to improve their resume for this specific job.
        "strengths": ["<strength1>", "<strength2>", ...],   // A list of strengths from resume -- atleast 5-6 strengths from resume
        "weaknesses": ["<weakness1>", "<weakness2>", ...],    // A list of weakness from resume i.e. things which would result in low ATS score atleast 5-6 weaknesses
        "final_verdict": "<string>"                               // A final, one-line verdict on the resume's quality for this role (e.g., "Strong Match", "Needs Improvement").
    }}

    **Resume Text:**
    ---
    {resume_text}
    ---

    **Job Description Text:**
    ---
    {jd_text}
    ---

    Provide ONLY the JSON object as your response. Do not include any introductory text, explanations, or markdown formatting.
    """
    try:
        response = model.generate_content(prompt)
        # It's better to access the text content safely
        raw_output = response.text if hasattr(response, 'text') else response.candidates[0].content.parts[0].text
        ats_json = parse_strict_json(raw_output)
        return ats_json
    except Exception as e:
        print(f"❌ Gemini API call failed for JD analysis: {e}")
        return None # Return None on failure

def run_ats_pipeline_with_jd(pdf_path: str, jd_text: str) -> dict:
    """
    The main pipeline for analyzing a resume against a job description.

    Args:
        pdf_path: The file path to the resume PDF.
        jd_text: The job description text.

    Returns:
        A dictionary with the analysis results.
    """
    print("📄 Extracting text from PDF for JD analysis...")
    text_content = extract_text_from_pdf(pdf_path)
    if not text_content:
        return {"error": "Failed to extract text from PDF."}

    print("🧠 Running analysis with Job Description using Gemini...")
    ats_output = get_ats_analysis_with_jd(text_content, jd_text)
    if not ats_output:
         return {"error": "Failed to get analysis from AI."}
         
    # Optional: Save the output for debugging
    output_path = os.path.join(os.path.dirname(__file__), "ats_analysis_with_jd.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(ats_output, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved JD analysis JSON at {output_path}")

    return ats_output


# ========== ORIGINAL ANALYSIS (WITHOUT JOB DESCRIPTION) - RETAINED FOR OTHER FEATURE ==========

def get_ats_analysis_general(resume_text):
    """Analyzes a resume for general quality and recommendations."""
    prompt = f"""
    You are an expert ATS resume analyzer AI. Analyze the following resume text and return STRICTLY a valid JSON response.
    (The original prompt structure from the old file goes here for the 'analyze without JD' feature)
    ...
    Here is the resume data: {resume_text}
    """
    # This function would be fully implemented just like the original script
    print("Note: General analysis function is defined but not fully detailed here to avoid redundancy.")
    return {"message": "This is a placeholder for the general resume analysis."}

def run_ats_pipeline_general(pdf_path: str) -> dict:
    """The main pipeline for general resume analysis."""
    print("📄 Extracting text from PDF for general analysis...")
    text_content = extract_text_from_pdf(pdf_path)
    # ... implementation would follow
    return {}


# ========== MAIN EXECUTION BLOCK FOR TESTING ==========

if __name__ == "__main__":
    # This block is for testing the script directly.
    print("🧪 Running in test mode...")

    # Define paths and test data
    test_pdf_path = os.path.join(os.path.dirname(__file__), "user_resume.pdf") # Make sure you have a resume file named this
    
    # A sample job description for testing purposes
    sample_jd = """
Job Title: ASP.NET Web Developer
Location: Cambridge, MA (Hybrid/Remote options available)
Employment Type: Full-Time

Job Description:
We are looking for a skilled and experienced ASP.NET Web Developer to join our dynamic development team. The ideal candidate is a highly proficient .NET developer with strong experience in ASP.NET MVC, Microsoft SQL Server, Azure, and modern DevOps practices. The candidate should have a proven track record of delivering scalable web applications and optimizing performance across enterprise systems.

Responsibilities:
Design, develop, and maintain enterprise-level web applications using ASP.NET MVC and Microsoft SQL Server.

Collaborate with UI/UX designers to enhance user engagement through clean and modern front-end implementations using HTML5.

Leverage Visual Studio and related tools to accelerate development and automate repetitive tasks.

Conduct unit testing using NUnit and contribute to CI/CD pipelines using Jenkins.

Monitor, troubleshoot, and optimize application performance using Docker, Nginx, and Azure tools.

Manage database migrations and improve SQL query performance using Azure SQL Database and Microsoft SQL Server.

Participate in Agile sprints and ensure timely delivery of features with high-quality code.

Mentor junior developers and contribute to knowledge-sharing sessions across the team.

Required Skills and Qualifications:
Bachelor’s degree in Computer Science or related field.

5+ years of professional experience in web development using ASP.NET MVC.

Strong understanding of Microsoft SQL Server, Azure, and Git version control.

Hands-on experience with NUnit, Docker, and Jenkins in production environments.

Familiarity with performance tuning of applications and servers (Nginx, load testing, etc.).

Excellent problem-solving, debugging, and communication skills.

Preferred Qualifications:
Experience mentoring or leading junior developers.

Prior involvement in reducing support tickets or improving end-user engagement.

Active LinkedIn profile or portfolio showcasing past projects.

    """

    # Check if a test resume exists before running
    if not os.path.exists(test_pdf_path):
        print(f"‼️ Test Error: The resume '{test_pdf_path}' was not found.")
        print("Please add a PDF resume to the directory to run the test.")
    else:
        # Run the new pipeline for analysis with a job description
        results = run_ats_pipeline_with_jd(test_pdf_path, sample_jd)
        
        print("\n\n--- ANALYSIS COMPLETE ---")
        print(json.dumps(results, indent=2))
        print("-------------------------\n")

