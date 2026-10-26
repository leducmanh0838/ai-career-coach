# app/services/analyze_skill_service/ai_config.py
import os
from pathlib import Path
import django
from django.core.management.base import CommandError
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

BASE_DIR = Path(__file__).resolve().parent

PROMPT_DIR = BASE_DIR / "prompts" # Điều chỉnh path tùy thực tế

def load_prompt(filename: str) -> str:
    path = PROMPT_DIR / filename
    if path.is_file():
        with path.open("r", encoding="utf-8") as file:
            return file.read()
    return ""

EXTRACT_CV_FACTS_SYSTEM_PROMPT = load_prompt("extract_cv_facts.txt")
EXTRACT_JD_FACTS_SYSTEM_PROMPT = load_prompt("extract_jd_facts.txt")
MATCH_CV_SKILLS_SYSTEM_PROMPT = load_prompt("match_cv_skills_with_ai.txt")
MATCH_JD_SKILLS_SYSTEM_PROMPT = load_prompt("match_jd_skills_with_ai.txt")

CRITICAL_MODEL = "gpt-4o"
LIGHT_MODEL = "gpt-4o-mini"
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536
DEFAULT_SKILL_TOP_K = 5

def get_llm(model_name: str = CRITICAL_MODEL):
    if not os.getenv("OPENAI_API_KEY"):
        raise CommandError("Thiếu biến môi trường OPENAI_API_KEY.")
    return ChatOpenAI(model=model_name, temperature=0, max_retries=3, timeout=60)

def get_embeddings():
    if not os.getenv("OPENAI_API_KEY"):
        raise CommandError("Thiếu biến môi trường OPENAI_API_KEY.")
    return OpenAIEmbeddings(model=EMBEDDING_MODEL, dimensions=EMBEDDING_DIMENSIONS, max_retries=3, request_timeout=30)