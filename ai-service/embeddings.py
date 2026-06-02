import json
import os
import urllib.error
import urllib.request
from functools import lru_cache

from sklearn.feature_extraction.text import HashingVectorizer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSIONS = 384
OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
OPENAI_EMBEDDING_DIMENSIONS = int(os.getenv("OPENAI_EMBEDDING_DIMENSIONS", str(EMBEDDING_DIMENSIONS)))


@lru_cache(maxsize=1)
def _load_sentence_transformer():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(MODEL_NAME)


def embed_text(text: str) -> dict:
    normalized_text = (text or "").strip()

    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        try:
            return _embed_with_openai(normalized_text, openai_api_key)
        except Exception:
            # Keep demos working if the API key, network, or quota is unavailable.
            pass

    try:
        model = _load_sentence_transformer()
        embedding = model.encode(normalized_text, normalize_embeddings=True).tolist()
        return {
            "model": MODEL_NAME,
            "dimensions": len(embedding),
            "embedding": [float(value) for value in embedding],
        }
    except Exception:
        # Keeps local demos working even before sentence-transformers/model files
        # are installed. Replace this fallback once the deployment has the model.
        vectorizer = HashingVectorizer(
            n_features=EMBEDDING_DIMENSIONS,
            alternate_sign=False,
            norm="l2",
        )
        vector = vectorizer.transform([normalized_text]).toarray()[0]
        return {
            "model": "sklearn-hashing-fallback",
            "dimensions": EMBEDDING_DIMENSIONS,
            "embedding": [float(value) for value in vector],
        }


def _embed_with_openai(text: str, api_key: str) -> dict:
    payload = {
        "model": OPENAI_EMBEDDING_MODEL,
        "input": text,
        "encoding_format": "float",
        "dimensions": OPENAI_EMBEDDING_DIMENSIONS,
    }
    request = urllib.request.Request(
        "https://api.openai.com/v1/embeddings",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI embedding request failed: {exc.code} {detail}") from exc

    embedding = data["data"][0]["embedding"]
    return {
        "model": data.get("model", OPENAI_EMBEDDING_MODEL),
        "dimensions": len(embedding),
        "embedding": [float(value) for value in embedding],
    }
