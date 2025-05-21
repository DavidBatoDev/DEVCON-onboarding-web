import os
import json
from app.core.config import settings

class SimpleVectorStore:
    def __init__(self):
        self.docs = []
        self.embeddings = []

    def add(self, doc_id, content, embedding):
        self.docs.append({"id": doc_id, "content": content})
        self.embeddings.append(embedding)

    def save(self, path):
        os.makedirs(path, exist_ok=True)
        with open(os.path.join(path, "docs.json"), "w", encoding="utf-8") as f:
            json.dump(self.docs, f, ensure_ascii=False, indent=2)
        with open(os.path.join(path, "embeddings.json"), "w") as f:
            json.dump(self.embeddings, f)

def save_to_store(metadatas, vectors):
    store = SimpleVectorStore()
    for metadata, emb in zip(metadatas, vectors):
        store.add(metadata["file_id"], metadata["file_name"], emb)
    store.save(settings.RAG_INDEX_DIR) 

def load_from_store():
    return SimpleVectorStore()
