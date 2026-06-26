from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import random

app = FastAPI(title="EduSight ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentInput(BaseModel):
    student_id: str
    name: str
    class_grade: str
    absences_this_month: int
    absence_streak: int
    math_score: float
    science_score: float
    seasonal_flag: bool

class RiskOutput(BaseModel):
    student_id: str
    risk_score: int
    risk_level: str
    top_signals: List[str]

class OCROutput(BaseModel):
    subjects: List[dict]
    raw_text: str

def compute_signals(student: StudentInput):
    signals = []
    if student.absences_this_month >= 10:
        signals.append(f"{student.absences_this_month} absences this month")
    if student.absence_streak >= 5:
        signals.append(f"{student.absence_streak}-day absence streak")
    if student.math_score < 40:
        signals.append("Failed Math mid-term")
    if student.science_score < 40:
        signals.append("Failed Science mid-term")
    if student.seasonal_flag:
        signals.append("Harvest season overlap")
    return signals

def compute_risk_score(student: StudentInput) -> int:
    score = 0
    score += min(student.absences_this_month * 3, 40)
    score += min(student.absence_streak * 2, 20)
    if student.math_score < 40:
        score += 15
    elif student.math_score < 60:
        score += 7
    if student.science_score < 40:
        score += 15
    elif student.science_score < 60:
        score += 7
    if student.seasonal_flag:
        score += 10
    return min(score, 100)

@app.get("/")
def root():
    return {"status": "EduSight ML API is running"}

@app.post("/predict", response_model=RiskOutput)
def predict(student: StudentInput):
    score = compute_risk_score(student)
    signals = compute_signals(student)
    if score >= 70:
        level = "high"
    elif score >= 40:
        level = "medium"
    else:
        level = "low"
    return RiskOutput(
        student_id=student.student_id,
        risk_score=score,
        risk_level=level,
        top_signals=signals if signals else ["No major signals detected"]
    )

@app.post("/ocr", response_model=OCROutput)
async def ocr_extract(file: UploadFile = File(...)):
    return OCROutput(
        subjects=[
            {"subject": "Mathematics", "marks": 38},
            {"subject": "Science", "marks": 42},
            {"subject": "Hindi", "marks": 55},
            {"subject": "English", "marks": 61},
            {"subject": "Social Studies", "marks": 47},
        ],
        raw_text="Placeholder OCR output — PaddleOCR will replace this in Phase 2"
    )

@app.post("/suggest")
def suggest(data: dict):
    score = data.get("risk_score", 50)
    signals = data.get("top_signals", [])
    if score >= 70:
        action = (
            "Schedule an immediate home visit. Coordinate with the parent on "
            "flexible attendance. Enroll the student in the Pratham remedial bridge program."
        )
    elif score >= 40:
        action = (
            "Send a written notice to parents. Monitor attendance weekly. "
            "Connect student to the school counsellor."
        )
    else:
        action = (
            "No immediate action needed. Continue monitoring attendance monthly."
        )
    return {
        "action": action,
        "source": "Pratham ASER 2023 evidence base (placeholder)",
        "confidence": "high" if score >= 70 else "medium"
    }