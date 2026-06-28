import json
import os
import urllib.error
import urllib.request
from datetime import date


OPENAI_CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")


def generate_job_draft(prompt: str) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is missing. Add it to ai-service/.env or export it before starting the AI service.")

    payload = {
        "model": OPENAI_CHAT_MODEL,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": (
                    "You create structured job posting drafts for a recruiting SaaS app. "
                    "Return JSON only. Do not include markdown or explanations. "
                    "Use concise, realistic business wording. "
                    "If a field is not provided, infer a reasonable value or use an empty string. "
                    "requiredSkills must contain 4 to 8 practical skills. "
                    "minimumExperienceYears must be an integer. "
                    "applicationDeadline must be YYYY-MM-DD or null. "
                    f"Today's date is {date.today().isoformat()}."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Create a job draft from this recruiter message.\n\n"
                    f"Recruiter message: {prompt}\n\n"
                    "Return exactly this JSON shape:\n"
                    "{"
                    "\"title\":\"\","
                    "\"company\":\"\","
                    "\"requiredSkills\":[\"\"],"
                    "\"minimumExperienceYears\":0,"
                    "\"educationLevel\":\"Bachelor\","
                    "\"location\":\"\","
                    "\"department\":\"\","
                    "\"employmentType\":\"Full-time\","
                    "\"workMode\":\"Hybrid\","
                    "\"salaryRange\":\"\","
                    "\"applicationDeadline\":null,"
                    "\"status\":\"Draft\""
                    "}"
                ),
            },
        ],
    }

    request = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI job draft request failed: {exc.code} {detail}") from exc

    content = data["choices"][0]["message"]["content"]
    draft = json.loads(content)
    return normalize_job_draft(draft)


def normalize_job_draft(draft: dict) -> dict:
    required_skills = draft.get("requiredSkills") or draft.get("required_skills") or []
    if isinstance(required_skills, str):
        required_skills = [skill.strip() for skill in required_skills.split(",") if skill.strip()]

    return {
        "title": str(draft.get("title") or "").strip(),
        "company": str(draft.get("company") or "").strip(),
        "requiredSkills": [str(skill).strip() for skill in required_skills if str(skill).strip()],
        "minimumExperienceYears": int(draft.get("minimumExperienceYears") or draft.get("minimum_experience_years") or 0),
        "educationLevel": str(draft.get("educationLevel") or draft.get("education_level") or "Bachelor").strip(),
        "location": str(draft.get("location") or "").strip(),
        "department": str(draft.get("department") or "").strip(),
        "employmentType": str(draft.get("employmentType") or draft.get("employment_type") or "Full-time").strip(),
        "workMode": str(draft.get("workMode") or draft.get("work_mode") or "Hybrid").strip(),
        "salaryRange": str(draft.get("salaryRange") or draft.get("salary_range") or "").strip(),
        "applicationDeadline": draft.get("applicationDeadline") or draft.get("application_deadline") or None,
        "status": str(draft.get("status") or "Draft").strip(),
    }
