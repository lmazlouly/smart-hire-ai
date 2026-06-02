# cv_parser.py
# Reads a PDF file and returns plain text.
# This is the first step: before we can extract anything, we need readable text.

import io
import pdfplumber


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Takes raw PDF bytes and returns all the text as a single string.
    Returns an empty string if extraction fails.
    """
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages_text = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text)
            return "\n".join(pages_text)
    except Exception as e:
        print(f"[cv_parser] Failed to extract text: {e}")
        return ""
