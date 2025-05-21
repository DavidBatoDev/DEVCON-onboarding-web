from fastapi import APIRouter
from pydantic import BaseModel
from app.services.rag_engine import answer_query

router = APIRouter()

class AskRequest(BaseModel):
    query: str

class AskResponse(BaseModel):
    answer: str

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    answer = await answer_query(request.query)
    return AskResponse(answer=answer)