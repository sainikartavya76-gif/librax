from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import RoleEnum

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None
    role: Optional[RoleEnum] = None

class LoginRequest(BaseModel):
    email_or_username: str
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
