import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env file
env_path = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GOOGLE_SERVICE_ACCOUNT_JSON = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    RAG_INDEX_DIR = os.getenv("RAG_INDEX_DIR")


settings = Settings()