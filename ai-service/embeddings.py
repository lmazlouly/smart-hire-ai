from functools import lru_cache

from sklearn.feature_extraction.text import HashingVectorizer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSIONS = 384


@lru_cache(maxsize=1)
def _load_sentence_transformer():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(MODEL_NAME)


def embed_text(text: str) -> dict:
    normalized_text = (text or "").strip()

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
