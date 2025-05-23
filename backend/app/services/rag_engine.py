from app.services.vector_store import load_from_store
from app.services.embedder import get_embedder
from app.core.config import settings
import google.generativeai as genai

# Configure Gemini API globally
genai.configure(api_key=settings.GEMINI_API_KEY)

# Initialize embedding and vector store
ebd_model = get_embedder()
vector_store = load_from_store()
gemini = genai.GenerativeModel("gemini-pro")

def retrieve_relevant_chunks(query: str, top_k: int = 3):
    query_emb = ebd_model.encode(query).tolist()
    results = vector_store.similarity_search(query_emb, top_k=top_k)
    return results

def answer_question(query: str):
    # Step 1: Retrieve relevant chunks
    top_chunks = retrieve_relevant_chunks(query)

    if not top_chunks:
        return "Sorry, I couldn’t find relevant information."

    # Step 2: Format context
    context = "\n\n".join([chunk["text"] for chunk in top_chunks])

    # Step 3: Generate answer with Gemini
    prompt = f"""
    You are a helpful assistant that answers questions based on internal DevCon documentation.

    Context:
    {context}

    Question:
    {query}

    Answer:
    """

    response = gemini.generate_content(prompt)
    return response.text.strip()