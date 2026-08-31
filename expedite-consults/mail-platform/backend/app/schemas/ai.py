from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class SummarizeRequest(BaseModel):
    thread_id: UUID

class SummarizeResponse(BaseModel):
    thread_id: UUID
    summary: str
    key_points: List[str]
    action_items: List[str]

class GenerateReplyRequest(BaseModel):
    thread_id: UUID
    tone: Optional[str] = "professional" # professional, casual, assertive, concise
    custom_instructions: Optional[str] = None

class GenerateReplyResponse(BaseModel):
    subject: str
    body_html: str
    body_plain: str
    suggested_quick_replies: List[str]

class CategorizeResponse(BaseModel):
    category: str # primary, updates, promotions, urgent
    confidence: float
    reason: str
