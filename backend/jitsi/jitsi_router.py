# jitsi_router.py
from fastapi import APIRouter
from pydantic import BaseModel
import uuid
import yagmail

router = APIRouter()

class MeetingRequest(BaseModel):
    applicant_email: str
    expert_email: str

@router.post("/create-meeting")
def create_meeting(data: MeetingRequest):
    # Generate a unique room ID
    room_id = f"careerConnect-{uuid.uuid4().hex[:8]}"
    meeting_url = f"https://meet.jit.si/{room_id}"

    #send mail
    yag = yagmail.SMTP(data.applicant_email, "hyjz utcr pnfu okuq")
    yag.send(
        to="danyalahmad.22311938@viit.ac.in",
                    subject=f"Application for a role at ",
                    contents=f"Dear,\n\n\n\nJoin now,\n{meeting_url}",
                )
    # Optional: Save to DB, send email, etc. here

    return {
        "room_id": room_id,
        "meeting_url": meeting_url,
        "applicant": data.applicant_email,
        "expert": data.expert_email,
        "message": "Meeting link created successfully."
    }

