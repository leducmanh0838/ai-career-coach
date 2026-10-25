from langchain_openai import OpenAIEmbeddings

from config import settings


def get_embedding_vector(text: str) -> list[float]:
    if not text or not text.strip():
        return None

    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        api_key=settings.OPENAI_API_KEY
    )

    # Sinh vector cho chuỗi văn bản đầu vào
    vector = embeddings.embed_query(text)
    return vector