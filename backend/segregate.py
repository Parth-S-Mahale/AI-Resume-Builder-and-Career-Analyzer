import json

# Function 
def extract_recommendation_lists(ats_json):
    job_roles = []
    certifications = []

    # ✅ Extract job roles
    job_recommendations = ats_json.get("job_role_recommendations", [])
    for job in job_recommendations:
        role = job.get("job_role")
        if role:
            job_roles.append(role)

    # ✅ Extract certifications
    cert_recommendations = ats_json.get("certification_recommendations", [])
    for cert in cert_recommendations:
        recommended = cert.get("recommended_courses", [])
        certifications.extend(recommended)

    return job_roles, certifications


# Example test block (optional - for CLI use)
'''
if __name__ == "__main__":
    with open("json_output/ats_analysis.json", "r", encoding="utf-8") as f:
        ats_data = json.load(f)
    
    job_roles, certifications = extract_recommendation_lists(ats_data)

    print("🧠 Job Role Recommendations:")
    print(job_roles)
    print("\n📚 Certification Recommendations:")
    print(certifications)
'''

