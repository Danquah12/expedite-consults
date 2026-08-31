from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    recovery_email: Optional[EmailStr] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    email: str
    display_name: Optional[str]

class UserProfile(BaseModel):
    id: UUID
    email: str
    display_name: Optional[str]
    quota_bytes: int
    used_bytes: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
