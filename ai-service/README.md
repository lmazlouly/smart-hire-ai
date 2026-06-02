# Smart Hire AI Service

Python microservice for CV parsing and candidate-job matching.

---

## What This Service Does

1. **Parses CVs** — extracts plain text from uploaded PDF files
2. **Extracts structured data** — finds skills, experience years, and education level
3. **Computes match scores** — compares candidate profiles to job requirements

---

## How It Works (Simple Explanation)

### Step 1 — CV Parsing
A candidate uploads a PDF. `pdfplumber` reads the PDF and returns all the text as a plain string.

### Step 2 — Extraction
The text is scanned for:
- **Skills** → keyword matching against a known list in `skills_list.py`
- **Experience** → regex patterns like "5 years of experience"
- **Education** → keyword matching for "master", "bachelor", "phd", etc.

### Step 3 — Matching
The Spring Boot backend sends candidate data + job data to `/match`.
The service computes a score using this formula (from PROJECT_SCOPE.md):

```
final_score = (skills * 0.50) + (experience * 0.30) + (education * 0.20)
```

Result is a number between 0 and 100, plus a list of missing skills.

---

## Project Structure

```
ai-service/
├── main.py          ← FastAPI routes
├── cv_parser.py     ← PDF → plain text
├── extractor.py     ← plain text → structured profile
├── matcher.py       ← candidate + job → score
├── skills_list.py   ← known skills database
└── requirements.txt
```

---

## How To Run

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
uvicorn main:app --reload --port 8000
```

The service runs on: `http://localhost:8000`

Interactive API docs: `http://localhost:8000/docs`

---

## Endpoints

| Method | Path            | Description                                 |
|--------|-----------------|---------------------------------------------|
| GET    | /health         | Check if service is running                 |
| POST   | /parse-cv       | Upload a PDF CV, get structured profile     |
| POST   | /parse-cv-text  | Send plain text CV, get structured profile  |
| POST   | /match          | Send candidate + job data, get match score  |

---

## Example: Match Request

```json
POST /match

{
  "candidate": {
    "skills": ["python", "django", "sql"],
    "experience_years": 3,
    "education_level": "MASTER"
  },
  "job": {
    "required_skills": ["python", "sql", "docker"],
    "minimum_experience_years": 2,
    "education_level": "BACHELOR"
  }
}
```

Response:
```json
{
  "final_score": 76.7,
  "skills_score": 66.7,
  "experience_score": 100.0,
  "education_score": 100.0,
  "missing_skills": ["docker"]
}
```

---

## How To Extend Later

- Add more skills to `skills_list.py`
- Improve `extractor.py` with spaCy for better NER (named entity recognition)
- Add a `/recommendations` endpoint that suggests training based on missing skills
- Plug in a real AI model (BERT, etc.) inside `extractor.py` without changing the API

---

## Education Levels (recognized values)

| Value        | Meaning                     |
|--------------|-----------------------------|
| HIGH_SCHOOL  | High school / Baccalauréat  |
| BTS          | BTS / DUT (French)          |
| BACHELOR     | Bachelor's / Licence        |
| MASTER       | Master's / MBA / MSc        |
| PHD          | PhD / Doctorate             |
| UNKNOWN      | Not detected                |