# main.py
# FastAPI entry point for the Smart Hire AI service.
#
# Available endpoints:
#   GET  /health            → check the service is running
#   POST /parse-cv          → upload a PDF, get back structured candidate data
#   POST /embed             → turn text into an embedding vector
#   POST /match             → send candidate + job data, get back a compatibility score

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from cv_parser import extract_text_from_pdf
from embeddings import embed_text
from extractor import extract_candidate_profile
from matcher import compute_match_score

app = FastAPI(
    title="Smart Hire AI Service",
    description="CV parsing, skill extraction, and candidate-job matching.",
    version="1.0.0",
)

# Allow the Angular frontend and Spring Boot backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Health Check ---

@app.get("/health")
def health():
    return {"status": "ok", "service": "smart-hire-ai"}


# --- CV Parsing (PDF upload) ---

@app.post("/parse-cv")
async def parse_cv(file: UploadFile = File(...)):
    """
    Upload a PDF CV and receive a structured profile back.

    Returns:
      - skills           : list of detected skills
      - experience_years : estimated years of experience
      - education_level  : detected education level
      - raw_text         : the full extracted text (useful for debugging)
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    text = extract_text_from_pdf(file_bytes)

    if not text:
        raise HTTPException(status_code=422, detail="Could not extract text from the PDF.")

    profile = extract_candidate_profile(text)
    profile["raw_text"] = text  # include for debugging or display

    return profile


# --- Embeddings ---

class EmbedRequest(BaseModel):
    text: str


@app.post("/embed")
def embed(body: EmbedRequest):
    """
    Turn a job or candidate profile text into a vector embedding.

    The backend stores this vector in PostgreSQL using pgvector.
    """
    if not body.text or not body.text.strip():
        raise HTTPException(status_code=400, detail="Text is required.")

    return embed_text(body.text)


# --- Candidate-Job Matching ---

class MatchRequest(BaseModel):
    candidate: dict
    job: dict

@app.post("/match")
def match(body: MatchRequest):
    """
    Send candidate data and job data, receive a compatibility score.

    Expected candidate fields:
      - skills           (list of strings)
      - experience_years (int)
      - education_level  (string)

    Expected job fields:
      - required_skills           (list of strings)
      - minimum_experience_years  (int)
      - education_level           (string)

    Returns:
      - final_score      : score out of 100
      - skills_score     : skills component score (out of 100)
      - experience_score : experience component score (out of 100)
      - education_score  : education component score (out of 100)
      - missing_skills   : skills the candidate is missing
    """
    result = compute_match_score(body.candidate, body.job)
    return result
