from app.services.vector_store import load_from_store
from app.services.embedder import embed_texts
from app.core.config import settings
import openai

# Initialize vector store
vector_store = load_from_store()

def retrieve_relevant_chunks(query: str, top_k: int = 3):
    query_emb = embed_texts([query])[0]
    return vector_store.similarity_search(query_emb, top_k=top_k)

def get_openai_response(query: str, context: str) -> str:
    openai.api_key = settings.OPENAI_API_KEY
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant answering questions based on internal DEVCON documents.",
            },
            {
                "role": "user",
                "content": (
                    f"Below is some context retrieved from documents. If it's helpful to answer the question or query, feel free to use it. Otherwise, ignore it. Add Emojis in chats to make it betters \n\n"
                    f"📚 Context:\n{context}\n\n"
                    f"🧠 Query:\n{query}"
                )
            }
        ],
        temperature=0.2,
        max_tokens=1024
    )
    return response.choices[0].message["content"]

def ask_with_rag(query: str) -> str:
    chunks = retrieve_relevant_chunks(query)

    print(f"Retrieved {len(chunks)} relevant chunks for query: {query}")

    print("Chunks:", chunks)

    if not chunks:
        return "Sorry, I couldn’t find relevant information from the documents."

    context = "\n\n".join([chunk.get("text") or chunk.get("content", "") for chunk in chunks])
    
    context = context[:48000]
    
    return get_openai_response(query, context).strip()
