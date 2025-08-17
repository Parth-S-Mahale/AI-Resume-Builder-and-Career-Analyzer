import PyPDF2
import re
import json
import json5
import demjson3
import google.generativeai as genai
import os

# ========== CONFIGURE GEMINI ==========
genai.configure(api_key="AIzaSyBz8BpqNokZLzznpuV2-sYT3f_uPDEh89c")
model = genai.GenerativeModel("models/gemini-2.5-flash")


# ========== Extract Text from PDF ==========
def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


# ========== Parse Resume Sections ==========
def parse_resume_sections(text):
    data = {}

    lines = [line.strip() for line in text.strip().split('\n') if line.strip()]
    data['Name'] = lines[0] if lines else "N/A"

    # Email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    data['Email'] = email_match.group() if email_match else "N/A"

    # Phone
    phone_match = re.search(r'\+?\d[\d\s\-()]{8,}', text)
    data['Phone'] = phone_match.group().strip() if phone_match else "N/A"

    # About / Summary
    data['About'] = " ".join(lines[1:4]) if len(lines) > 4 else "N/A"

    sections = ['EXPERIENCE', 'EDUCATION', 'ACHIEVEMENTS', 'PROJECTS',
                'TECHNICAL SKILLS', 'EXTRA CURRICULARS', 'POSITION OF RESPONSIBILITY']

    section_data = {}
    current_section = None

    for line in lines:
        line_upper = line.strip().upper()
        if line_upper in sections:
            current_section = line_upper.title()
            section_data[current_section] = []
        elif current_section:
            section_data[current_section].append(line)

    for section, content in section_data.items():
        data[section] = "\n".join(content).strip()

    return data


# ========== Get ATS Score and Suggestions from GenAI ==========
def get_ats_analysis(parsed_resume_json):
    prompt = f"""
You are an expert ATS resume analyzer AI.

Analyze the following resume (in JSON) and return STRICTLY a valid JSON response in this format below:

{{
  "ats_score": <number 0-100>, 
  "resume_summary": {{
    "name": <name>,
    "total_experience_years": <number or estimate>,
    "education": [<degree1>, <degree2>, ...],
    "skills": {{
      "languages": [<language1>, <language2>, ...],
      "frameworks": [<framework1>, <framework2>, ...],
      "tools": [<tool1>, <tool2>, ...],
      "computerScience": [<concept1>, <concept2>, ...],
      "softskills": [<softskill1>, <softskill2>, ...] 
    }}, // skills categorized into languages, frameworks, tools, computer science concepts, and soft skills based on the resume i.e. consider only the skills that are mentioned in the resume
    "certifications": [<cert1>, <cert2>, ...]
  }},
  "strengths": [<point1>, <point2>, ...], // key strengths or positive aspects of the resume
  "weaknesses": [<point1>, <point2>, ...], // faults or missing information in the resume
  "missing_keywords": [<keyword1>, <keyword2>, ...],  // Keywords that are relevant but not present in the resume (always try to give at-least 3-4 keywords that can improve ats score)
  "missing_soft_skills": [<skill1>, <skill2>, ...], // Soft skills that are relevant but not present in the resume (always try to give at-least 1-2 missing skills that can improve ats score)
  "missing_hard_skills": [<skill1>, <skill2>, ...],    // Hard Skills that are relevant but not present in the resume (always try to give at-least 1-2 missing skills that can improve ats score)
  "missing_certifications": [<cert1>, <cert2>, ...], // Certifications that are relevant but not present in the resume (always try to give at-least 1-2 missing certifications that can improve ats score)
  "suggestions_for_improvement": [<tip1>, <tip2>, ...],  // Tips to improve the resume (at-least 5-6-8)
  "certification_recommendations": [   // Recommended certifications based on missing skills always try to give some certifications that can improve the resume at least 2-3  
    {{
      "skill": <skill1>,
      "recommended_courses": [<course1>, <course2>]
    }},{{
      "skill": <skill2>,
      "recommended_courses": [<course1>, <course2>]
    }}
  ],
  "job_role_recommendations": [   // Recommended all possible job roles based on the resume that the person can apply to give minimum 4-5 job roles that match the resume and user can apply to.
    // job_role must NOT include parentheses, brackets, or descriptors like (Mid-Level), (Java), etc. Use only the clean job title.
    {{
      "job_role": <title>,
      "match_percentage": <number>,    // Percentage match of the resume with this job role (0-100)
      "missing_skills": [<skill1>, <skill2>, ...], // Skills that are missing in the resume but required for this particular job role
      "reason": <short text> 
    }}
  ],
  "final_verdict": <one-line summary>
}}

DO NOT include any extra text or explanation outside of JSON.

Here is the resume data:

{json.dumps(parsed_resume_json, indent=2)}
"""
    try:
        response = model.generate_content(prompt)
        raw_output = response.text
        ats_json = parse_strict_json(raw_output)  # <- Parse it!
        return ats_json  # <- This will be a dictionary (or None)
    except Exception as e:
        print("❌ Gemini API call failed:", e)
        raise e

# ========== Attempt to Fix and Parse JSON ==========
def parse_strict_json(raw_response):
    cleaned = raw_response.strip().replace("```json", "").replace("```", "")

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    try:
        return json5.loads(cleaned)
    except Exception:
        pass

    try:
        return demjson3.decode(cleaned)
    except Exception:
        return None


# ========== Save JSON to File ==========
def save_to_json(data, output_file):
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"✅ Saved JSON at {output_file}")

#============To import it in another file========
def run_ats_pipeline(pdf_path: str) -> dict:
    print("📄 Extracting text from PDF...")
    text_content = extract_text_from_pdf(pdf_path)

    print("🧠 Running analysis using Gemini Pro...")
    ats_output = get_ats_analysis(text_content)

    output_path = os.path.join(os.path.dirname(__file__), "ats_analysis.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(ats_output, f, indent=2, ensure_ascii=False)

    return ats_output


# Optional: still allow direct execution for testing
if __name__ == "__main__":
    test_pdf = os.path.join(os.path.dirname(__file__), "user_resume.pdf")
    results = run_ats_pipeline(test_pdf)
    print(json.dumps(results, indent=2))

