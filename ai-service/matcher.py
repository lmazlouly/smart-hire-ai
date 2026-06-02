# matcher.py
# Computes a compatibility score between a candidate and a job offer.
#
# Scoring formula (from PROJECT_SCOPE.md):
#   50% → skills match
#   30% → experience match
#   20% → education match
#
# Skills matching uses TWO methods combined:
#   1. Keyword matching  → exact skill name lookup (fast, reliable)
#   2. TF-IDF + Cosine Similarity → finds similarity even without exact matches
#
# Final skills score = average of both methods.

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Education levels ranked lowest to highest.
# A candidate with a higher level than required still gets full score.
EDUCATION_RANK = {
    "UNKNOWN":     0,
    "HIGH_SCHOOL": 1,
    "BTS":         2,
    "BACHELOR":    3,
    "MASTER":      4,
    "PHD":         5,
}


# --- Skills Score: Method 1 — Keyword Matching ---

def _keyword_skills_score(candidate_skills: list[str], required_skills: list[str]) -> float:
    """
    Exact keyword match: how many required skills does the candidate have?
    Returns a value between 0.0 and 1.0.

    Example:
      candidate = ["python", "django", "sql"]
      required  = ["python", "sql", "docker"]
      matched   = ["python", "sql"]  → 2/3 = 0.66
    """
    if not required_skills:
        return 1.0

    candidate_set = set(s.lower() for s in candidate_skills)
    required_set  = set(s.lower() for s in required_skills)

    matched = candidate_set.intersection(required_set)
    return len(matched) / len(required_set)


# --- Skills Score: Method 2 — TF-IDF + Cosine Similarity ---

def _tfidf_skills_score(candidate_skills: list[str], required_skills: list[str]) -> float:
    """
    Converts both skill lists into TF-IDF vectors and measures
    how similar they are using cosine similarity.

    Why this is useful:
      Keyword matching misses near-matches.
      e.g. candidate has "js", job requires "javascript" → keyword = 0, tfidf > 0
      e.g. candidate has "postgres", job requires "postgresql" → keyword = 0, tfidf > 0

    How cosine similarity works:
      Both skill lists are turned into vectors (lists of numbers).
      We measure the angle between those vectors.
      Angle = 0°  → identical → score 1.0
      Angle = 90° → nothing in common → score 0.0

    Returns a value between 0.0 and 1.0.
    """
    if not required_skills:
        return 1.0

    if not candidate_skills:
        return 0.0

    candidate_text = " ".join(candidate_skills).lower()
    required_text  = " ".join(required_skills).lower()

    try:
        vectorizer = TfidfVectorizer(
            analyzer='char_wb',  # character-level: better for partial word matches
            ngram_range=(2, 4),  # looks at groups of 2-4 characters
        )
        matrix = vectorizer.fit_transform([candidate_text, required_text])
        score  = cosine_similarity(matrix[0], matrix[1])[0][0]
        return float(score)
    except Exception:
        # If vectorizer fails (e.g. empty vocab), fall back to 0
        return 0.0


# --- Combined Skills Score ---

def compute_skills_score(candidate_skills: list[str], required_skills: list[str]) -> float:
    """
    Combines both methods for a more robust skills score.

    - Keyword matching catches exact matches reliably.
    - TF-IDF catches partial/similar matches.
    - Taking the average of both gives a balanced result.

    Returns a value between 0.0 and 1.0.
    """
    keyword_score = _keyword_skills_score(candidate_skills, required_skills)
    tfidf_score   = _tfidf_skills_score(candidate_skills, required_skills)

    return (keyword_score + tfidf_score) / 2


# --- Experience Score ---

def compute_experience_score(candidate_years: int, required_years: int) -> float:
    """
    Compares candidate experience to job requirement.
    Returns a value between 0.0 and 1.0.

    - Equal or more → 1.0 (full score)
    - Less → proportional score (e.g. 2 years out of 4 required → 0.5)
    """
    if required_years <= 0:
        return 1.0

    if candidate_years >= required_years:
        return 1.0

    return candidate_years / required_years


# --- Education Score ---

def compute_education_score(candidate_level: str, required_level: str) -> float:
    """
    Compares candidate education to required level.
    Returns 1.0 if candidate meets or exceeds requirement, 0.0 otherwise.
    """
    candidate_rank = EDUCATION_RANK.get(candidate_level, 0)
    required_rank  = EDUCATION_RANK.get(required_level, 0)

    if candidate_rank >= required_rank:
        return 1.0
    return 0.0


# --- Main Match Function ---

def compute_match_score(candidate: dict, job: dict) -> dict:
    """
    Main matching function. Takes a candidate dict and a job dict.
    Returns the score breakdown and the final score out of 100.

    Expected candidate keys:
      - skills           (list of strings)
      - experience_years (int)
      - education_level  (string)

    Expected job keys:
      - required_skills           (list of strings)
      - minimum_experience_years  (int)
      - education_level           (string)

    Returns:
      - final_score      : overall score out of 100
      - skills_score     : skills component (out of 100)
      - experience_score : experience component (out of 100)
      - education_score  : education component (out of 100)
      - missing_skills   : skills the candidate is missing (exact matches only)
      - score_breakdown  : shows keyword vs tfidf scores for transparency
    """
    candidate_skills = candidate.get("skills", [])
    required_skills  = job.get("required_skills", [])

    # Compute each component
    keyword_score    = _keyword_skills_score(candidate_skills, required_skills)
    tfidf_score      = _tfidf_skills_score(candidate_skills, required_skills)
    skills_score     = (keyword_score + tfidf_score) / 2

    experience_score = compute_experience_score(
        candidate.get("experience_years", 0),
        job.get("minimum_experience_years", 0)
    )
    education_score  = compute_education_score(
        candidate.get("education_level", "UNKNOWN"),
        job.get("education_level", "UNKNOWN")
    )

    # Apply weights from PROJECT_SCOPE.md
    final_score = (
        skills_score     * 0.50 +
        experience_score * 0.30 +
        education_score  * 0.20
    ) * 100

    # Missing skills (keyword-based — exact names only, useful for recommendations)
    candidate_set  = set(s.lower() for s in candidate_skills)
    required_set   = set(s.lower() for s in required_skills)
    missing_skills = list(required_set - candidate_set)

    return {
        "final_score":      round(final_score, 1),
        "skills_score":     round(skills_score * 100, 1),
        "experience_score": round(experience_score * 100, 1),
        "education_score":  round(education_score * 100, 1),
        "missing_skills":   missing_skills,
        "score_breakdown": {
            "skills_keyword_score": round(keyword_score * 100, 1),
            "skills_tfidf_score":   round(tfidf_score * 100, 1),
        }
    }