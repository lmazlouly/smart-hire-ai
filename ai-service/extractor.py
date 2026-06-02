# extractor.py
# Takes plain CV text and extracts:
#   - skills (list of strings)
#   - experience_years (integer)
#   - education_level (string)
#
# Approach: keyword matching + simple regex.
# No ML model needed. Easy to read, easy to extend.

import re
from skills_list import KNOWN_SKILLS


# --- Skills Extraction ---

def extract_skills(text: str) -> list[str]:
    """
    Looks for known skills inside the CV text.
    Returns a list of matched skill names (lowercase, deduplicated).
    """
    text_lower = text.lower()
    found = []

    for skill in KNOWN_SKILLS:
        # Use word boundary matching to avoid partial matches
        # e.g. "r" should not match inside "recruiter"
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)

    return found


# --- Experience Extraction ---

# These patterns look for things like:
#   "5 years of experience"
#   "3+ years"
#   "2 ans d'expérience"  (French support bonus)
EXPERIENCE_PATTERNS = [
    r'(\d+)\s*\+?\s*years?\s*of\s*experience',
    r'(\d+)\s*\+?\s*years?\s*experience',
    r'experience\s*[:\-]?\s*(\d+)\s*\+?\s*years?',
    r'(\d+)\s*ans?\s*d\'expérience',  # French
]

def extract_experience_years(text: str) -> int:
    """
    Tries to find how many years of experience are mentioned in the CV.
    Returns the highest number found, or 0 if nothing is found.
    """
    text_lower = text.lower()
    found_values = []

    for pattern in EXPERIENCE_PATTERNS:
        matches = re.findall(pattern, text_lower)
        for match in matches:
            try:
                found_values.append(int(match))
            except ValueError:
                pass

    if found_values:
        return max(found_values)  # take the highest mentioned value
    return 0


# --- Education Extraction ---

# Map of keywords to a normalized education level.
# Order matters: check the highest level first.
EDUCATION_KEYWORDS = [
    ("phd",         "PHD"),
    ("doctorate",   "PHD"),
    ("doctorat",    "PHD"),          # French
    ("master",      "MASTER"),
    ("msc",         "MASTER"),
    ("mba",         "MASTER"),
    ("bachelor",    "BACHELOR"),
    ("licence",     "BACHELOR"),     # French
    ("bsc",         "BACHELOR"),
    ("b.sc",        "BACHELOR"),
    ("degree",      "BACHELOR"),
    ("bts",         "BTS"),          # French vocational
    ("dut",         "BTS"),          # French vocational
    ("high school", "HIGH_SCHOOL"),
    ("baccalauréat","HIGH_SCHOOL"),  # French
    ("bac",         "HIGH_SCHOOL"),  # French
]

def extract_education_level(text: str) -> str:
    """
    Looks for education level keywords in the CV text.
    Returns the highest level found, or "UNKNOWN" if nothing matches.
    """
    text_lower = text.lower()

    for keyword, level in EDUCATION_KEYWORDS:
        if keyword in text_lower:
            return level

    return "UNKNOWN"


# --- Main function ---

def extract_candidate_profile(text: str) -> dict:
    """
    Runs all extractors and returns a structured candidate profile dict.
    This is what the API endpoint will call.
    """
    return {
        "skills": extract_skills(text),
        "experience_years": extract_experience_years(text),
        "education_level": extract_education_level(text),
    }