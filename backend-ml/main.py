from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
import joblib
import tempfile
import os
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

app = FastAPI(title="EduSight ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and features on startup
model = joblib.load("model.pkl")
FEATURES = joblib.load("features.pkl")

# Load RAG components
print("Loading RAG vector store...")
rag_embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"}
)
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=rag_embeddings
)
print("RAG vector store loaded!")

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

def engineer_features(student: StudentInput) -> pd.DataFrame:
    absence_rate = student.absences_this_month / 30
    avg_score = (student.math_score + student.science_score) / 2
    grade_risk = (
        (1 if student.math_score < 40 else 0) +
        (1 if student.science_score < 40 else 0)
    )
    seasonal_weight = float(student.seasonal_flag) * 1.3
    combined_risk = absence_rate * grade_risk * (1 + seasonal_weight)

    data = {
        "absences_this_month": student.absences_this_month,
        "absence_streak": student.absence_streak,
        "math_score": student.math_score,
        "science_score": student.science_score,
        "seasonal_flag": float(student.seasonal_flag),
        "absence_rate": absence_rate,
        "avg_score": avg_score,
        "grade_risk": grade_risk,
        "seasonal_weight": seasonal_weight,
        "combined_risk": combined_risk,
    }
    return pd.DataFrame([data])[FEATURES]

def compute_signals(student: StudentInput) -> List[str]:
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
    if not signals:
        signals.append("No major signals detected")
    return signals

@app.get("/")
def root():
    return {"status": "EduSight ML API is running"}

@app.post("/predict", response_model=RiskOutput)
def predict(student: StudentInput):
    features = engineer_features(student)
    prob = model.predict_proba(features)[0][1]
    risk_score = int(round(prob * 100))

    if risk_score >= 70:
        risk_level = "high"
    elif risk_score >= 40:
        risk_level = "medium"
    else:
        risk_level = "low"

    signals = compute_signals(student)

    return RiskOutput(
        student_id=student.student_id,
        risk_score=risk_score,
        risk_level=risk_level,
        top_signals=signals,
    )

@app.post("/ocr", response_model=OCROutput)
async def ocr_extract(file: UploadFile = File(...)):
    try:
        import tempfile, os
        from ocr import extract_marks_from_image

        contents = await file.read()
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=os.path.splitext(file.filename)[1]
        ) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        result = extract_marks_from_image(tmp_path)
        os.unlink(tmp_path)

        return OCROutput(
            subjects=result["subjects"],
            raw_text=result["raw_text"]
        )
    except Exception as e:
        return OCROutput(
            subjects=[
                {"subject": "Mathematics", "marks": 0},
                {"subject": "Science", "marks": 0},
            ],
            raw_text=f"OCR error: {str(e)}"
        )

@app.post("/suggest")
def suggest(data: dict):
    score = data.get("risk_score", 50)
    signals = data.get("top_signals", [])
    name = data.get("name", "the student")

    signals_text = ", ".join(signals) if signals else "general risk indicators"

    query = f"intervention for student with {signals_text} dropout risk score {score}"
    docs = vectorstore.similarity_search(query, k=3)
    context = "\n\n".join([doc.page_content for doc in docs])

    if score >= 70:
        action = (
            f"IMMEDIATE ACTION REQUIRED for {name} (Risk Score: {score}/100)\n\n"
            f"Key concerns identified: {signals_text}\n\n"
            f"Recommended steps based on ASER/Pratham evidence:\n"
            f"1. Conduct a home visit within 48 hours to meet parents/guardians\n"
            f"2. Create a flexible attendance plan if harvest season is a factor\n"
            f"3. Enroll {name} in Pratham's Teaching at the Right Level (TaRL) remedial program\n"
            f"4. Check enrollment in PM-POSHAN mid-day meal scheme\n"
            f"5. Schedule follow-up visit within 2 weeks to assess improvement\n\n"
            f"Evidence base: {context[:300]}..."
        )
        source = "ASER 2022 Report, Pratham TaRL Program Guidelines"
        confidence = "high"

    elif score >= 40:
        action = (
            f"MONITOR CLOSELY: {name} (Risk Score: {score}/100)\n\n"
            f"Warning signs detected: {signals_text}\n\n"
            f"Recommended steps:\n"
            f"1. Send written attendance notice to parents this week\n"
            f"2. Schedule a parent meeting at school within 10 days\n"
            f"3. Connect {name} to school counsellor for academic support\n"
            f"4. Monitor attendance weekly for the next month\n"
            f"5. Consider peer learning group enrollment\n\n"
            f"Evidence base: {context[:300]}..."
        )
        source = "ASER 2022 Early Warning Protocols"
        confidence = "medium"

    else:
        action = (
            f"LOW RISK: {name} (Risk Score: {score}/100)\n\n"
            f"No immediate action needed. Continue standard monitoring.\n\n"
            f"Preventive steps:\n"
            f"1. Include {name} in monthly attendance review\n"
            f"2. Ensure enrollment in PM-POSHAN scheme\n"
            f"3. Check in with teacher at next school visit\n\n"
            f"Evidence base: {context[:200]}..."
        )
        source = "Standard Monitoring Protocol"
        confidence = "low"

    return {
        "action": action,
        "source": source,
        "confidence": confidence,
        "retrieved_chunks": len(docs)
    }