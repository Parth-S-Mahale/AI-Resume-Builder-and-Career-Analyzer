from fastapi import APIRouter
from pydantic import BaseModel, HttpUrl
from typing import List, Optional

router = APIRouter()

class WorkExperience(BaseModel):
    title: str
    company: str
    duration: str
    description: Optional[str] = None

class Project(BaseModel):
    project_name: str
    description: str
    tech_stack: Optional[List[str]] = []

class Achievement(BaseModel):
    title: str
    description: Optional[str] = None

class Skills(BaseModel):
    languages: List[str]
    frameworks: List[str]
    tools: List[str]
    softskills: List[str]

class Education(BaseModel):
    college_name: str
    degree: Optional[str] = None

class ResumeInput(BaseModel):
    name: str
    phone: str
    email: str
    linkedin_url: Optional[HttpUrl] = None
    github_url: Optional[HttpUrl] = None
    work_experience: Optional[List[WorkExperience]] = []
    projects: Optional[List[Project]] = []
    achievements: Optional[List[Achievement]] = []
    skills: Skills
    courses: Optional[List[str]] = []
    education: Optional[List[Education]] = []

@router.post("/submit-resume/")
async def submit_resume(data: ResumeInput):
    # For now just print or log received data
    print("Received resume data:", data)
    return {"message": "Resume data received successfully", "data": data}

