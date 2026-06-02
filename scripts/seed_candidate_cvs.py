#!/usr/bin/env python3
"""Seed candidate users and upload generated PDF CVs through the backend API.

Usage:
    python3 scripts/seed_candidate_cvs.py
    API_BASE_URL=http://localhost:8080/api python3 scripts/seed_candidate_cvs.py
"""

from __future__ import annotations

import json
import os
import re
import textwrap
from pathlib import Path
from typing import Iterable

import requests


API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8080/api").rstrip("/")
PASSWORD = os.environ.get("SEED_CANDIDATE_PASSWORD", "123456")
OUT_DIR = Path(os.environ.get("SEED_CV_DIR", "/private/tmp/smart-hire-ai-candidate-cvs"))


CANDIDATES = [
    {
        "name": "Nadia Amrani",
        "email": "nadia.amrani.candidate@smarthire.test",
        "title": "Backend Java Engineer",
        "location": "Casablanca, Morocco",
        "experience": 4,
        "education": "Bachelor",
        "skills": ["Java", "Spring Boot", "PostgreSQL", "REST APIs", "Docker", "Git", "Linux"],
        "summary": "Backend engineer building REST APIs, PostgreSQL schemas, and Spring Boot services for hiring platforms.",
    },
    {
        "name": "Youssef Benali",
        "email": "youssef.benali.candidate@smarthire.test",
        "title": "Frontend Angular Developer",
        "location": "Rabat, Morocco",
        "experience": 3,
        "education": "Bachelor",
        "skills": ["Angular", "TypeScript", "RxJS", "Tailwind CSS", "REST APIs", "HTML", "CSS"],
        "summary": "Frontend developer focused on Angular dashboards, responsive UI, and API integration.",
    },
    {
        "name": "Meriem Zahra",
        "email": "meriem.zahra.candidate@smarthire.test",
        "title": "Machine Learning Engineer",
        "location": "Casablanca, Morocco",
        "experience": 3,
        "education": "Master",
        "skills": ["Python", "Machine Learning", "NLP", "Embeddings", "scikit-learn", "FastAPI", "PostgreSQL"],
        "summary": "ML engineer creating NLP pipelines, embedding models, and candidate-job matching services.",
    },
    {
        "name": "Karim Idrissi",
        "email": "karim.idrissi.candidate@smarthire.test",
        "title": "DevOps Engineer",
        "location": "Tangier, Morocco",
        "experience": 5,
        "education": "Bachelor",
        "skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Monitoring"],
        "summary": "DevOps engineer automating deployments, cloud infrastructure, and CI/CD pipelines.",
    },
    {
        "name": "Salma El Fassi",
        "email": "salma.elfassi.candidate@smarthire.test",
        "title": "Data Analyst",
        "location": "Marrakesh, Morocco",
        "experience": 2,
        "education": "Bachelor",
        "skills": ["SQL", "Python", "Power BI", "Excel", "Data Visualization", "Statistics"],
        "summary": "Data analyst turning hiring and business data into dashboards, reports, and decisions.",
    },
    {
        "name": "Omar Tazi",
        "email": "omar.tazi.candidate@smarthire.test",
        "title": "Next.js Developer",
        "location": "Casablanca, Morocco",
        "experience": 4,
        "education": "Bachelor",
        "skills": ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", "REST APIs", "Vercel"],
        "summary": "Full-stack web developer building production Next.js and React applications.",
    },
    {
        "name": "Imane Berrada",
        "email": "imane.berrada.candidate@smarthire.test",
        "title": "Cybersecurity Analyst",
        "location": "Rabat, Morocco",
        "experience": 3,
        "education": "Master",
        "skills": ["Security", "OWASP", "SIEM", "Linux", "Network Security", "Incident Response", "Python"],
        "summary": "Security analyst monitoring threats, reviewing web application risks, and improving secure delivery.",
    },
    {
        "name": "Hamza Alaoui",
        "email": "hamza.alaoui.candidate@smarthire.test",
        "title": "HR Tech Project Manager",
        "location": "Casablanca, Morocco",
        "experience": 5,
        "education": "Master",
        "skills": ["Project Management", "Agile", "HR Systems", "Stakeholder Management", "Scrum", "Jira"],
        "summary": "Project manager coordinating HR technology releases, stakeholders, agile teams, and delivery plans.",
    },
    {
        "name": "Leila Mansouri",
        "email": "leila.mansouri.candidate@smarthire.test",
        "title": "QA Automation Engineer",
        "location": "Fes, Morocco",
        "experience": 3,
        "education": "Bachelor",
        "skills": ["QA Automation", "Playwright", "Selenium", "Java", "API Testing", "Postman", "CI/CD"],
        "summary": "QA engineer building reliable automated tests for frontend, backend, and API workflows.",
    },
    {
        "name": "Anas Chraibi",
        "email": "anas.chraibi.candidate@smarthire.test",
        "title": "Cloud Backend Developer",
        "location": "Agadir, Morocco",
        "experience": 4,
        "education": "Bachelor",
        "skills": ["Node.js", "Java", "Spring Boot", "AWS", "PostgreSQL", "Docker", "Microservices"],
        "summary": "Backend developer designing cloud APIs, microservices, and database-backed services.",
    },
    {
        "name": "Sara El Khattabi",
        "email": "sara.elkhattabi.candidate@smarthire.test",
        "title": "Product Designer",
        "location": "Rabat, Morocco",
        "experience": 4,
        "education": "Bachelor",
        "skills": ["UI Design", "UX Research", "Figma", "Design Systems", "Prototyping", "Accessibility"],
        "summary": "Product designer creating polished SaaS workflows, user research plans, and design systems.",
    },
    {
        "name": "Mehdi Bouzid",
        "email": "mehdi.bouzid.candidate@smarthire.test",
        "title": "Full Stack Developer",
        "location": "Casablanca, Morocco",
        "experience": 2,
        "education": "Bachelor",
        "skills": ["React", "Spring Boot", "Java", "PostgreSQL", "Docker", "REST APIs", "Git"],
        "summary": "Full-stack developer comfortable with React frontends and Spring Boot backend APIs.",
    },
]


def pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def build_pdf_text(candidate: dict) -> list[str]:
    return [
        candidate["name"],
        candidate["title"],
        f"Email: {candidate['email']}",
        f"Location: {candidate['location']}",
        "",
        "Professional Summary",
        candidate["summary"],
        "",
        "Skills",
        ", ".join(candidate["skills"]),
        "",
        "Experience",
        f"{candidate['experience']} years of professional experience.",
        "Built production systems, collaborated with cross-functional teams, and delivered maintainable software.",
        "",
        "Education",
        candidate["education"],
    ]


def make_pdf(path: Path, lines: Iterable[str]) -> None:
    escaped_lines = [pdf_escape(line) for line in lines]
    stream_lines = ["BT", "/F1 11 Tf", "50 790 Td", "14 TL"]
    first = True
    for line in escaped_lines:
        if not first:
            stream_lines.append("T*")
        stream_lines.append(f"({line}) Tj")
        first = False
    stream_lines.append("ET")
    stream = "\n".join(stream_lines).encode("utf-8")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream",
    ]

    content = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(content))
        content.extend(f"{index} 0 obj\n".encode("ascii"))
        content.extend(obj)
        content.extend(b"\nendobj\n")

    xref_offset = len(content)
    content.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    content.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        content.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    content.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("ascii")
    )
    path.write_bytes(content)


def request_json(method: str, url: str, **kwargs) -> requests.Response:
    response = requests.request(method, url, timeout=60, **kwargs)
    return response


def get_token(candidate: dict) -> str:
    payload = {
        "fullName": candidate["name"],
        "email": candidate["email"],
        "password": PASSWORD,
        "role": "CANDIDATE",
    }
    register = request_json("POST", f"{API_BASE_URL}/auth/register", json=payload)
    if register.status_code in (200, 201):
        return register.json()["token"]
    if register.status_code != 409:
        raise RuntimeError(f"register failed for {candidate['email']}: {register.status_code} {register.text}")

    login = request_json("POST", f"{API_BASE_URL}/auth/login", json={"email": candidate["email"], "password": PASSWORD})
    if login.status_code not in (200, 201):
        raise RuntimeError(f"login failed for {candidate['email']}: {login.status_code} {login.text}")
    return login.json()["token"]


def upload_cv(candidate: dict, pdf_path: Path, token: str) -> dict:
    with pdf_path.open("rb") as handle:
        response = request_json(
            "POST",
            f"{API_BASE_URL}/candidate/cvs",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": (pdf_path.name, handle, "application/pdf")},
        )
    if response.status_code not in (200, 201):
        raise RuntimeError(f"upload failed for {candidate['email']}: {response.status_code} {response.text}")
    return response.json()


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"API: {API_BASE_URL}")
    print(f"CV directory: {OUT_DIR}")
    print(f"Password for all candidates: {PASSWORD}")
    print()

    seeded = []
    for candidate in CANDIDATES:
        pdf_path = OUT_DIR / f"{slugify(candidate['name'])}-cv.pdf"
        make_pdf(pdf_path, build_pdf_text(candidate))
        token = get_token(candidate)
        cv = upload_cv(candidate, pdf_path, token)
        seeded.append(
            {
                "name": candidate["name"],
                "email": candidate["email"],
                "password": PASSWORD,
                "cvVersion": cv.get("versionNumber"),
                "parseStatus": cv.get("parseStatus"),
                "fileUrl": cv.get("fileUrl"),
            }
        )
        print(f"OK {candidate['email']} -> CV v{cv.get('versionNumber')} ({cv.get('parseStatus')})")

    summary_path = OUT_DIR / "seed-summary.json"
    summary_path.write_text(json.dumps(seeded, indent=2), encoding="utf-8")
    print()
    print(f"Seeded {len(seeded)} candidates.")
    print(f"Summary: {summary_path}")


if __name__ == "__main__":
    main()
