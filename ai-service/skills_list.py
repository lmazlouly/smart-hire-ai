# skills_list.py
# This is the list of skills the extractor will look for in CV text.
# Add more skills here as needed. Keep them lowercase.

KNOWN_SKILLS = [
    # Programming languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "ruby",
    "php", "swift", "kotlin", "rust", "scala", "r",

    # Web frontend
    "html", "css", "react", "angular", "vue", "tailwind", "bootstrap",
    "next.js", "nuxt",

    # Web backend
    "spring boot", "spring", "django", "fastapi", "flask", "express",
    "node.js", "nodejs", "laravel",

    # Databases
    "postgresql", "mysql", "mongodb", "sqlite", "redis", "oracle",
    "sql", "nosql",

    # DevOps / Cloud
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "github",
    "gitlab", "ci/cd", "linux", "bash",

    # Data / AI
    "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
    "pandas", "numpy", "nlp", "spacy", "transformers",

    # Tools
    "maven", "gradle", "npm", "webpack", "jira", "confluence", "figma",

    # Soft skills (optional — comment out if not needed)
    "communication", "teamwork", "leadership", "problem solving",
]