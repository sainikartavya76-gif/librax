from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from app.models.user import RoleEnum

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: Optional[RoleEnum] = RoleEnum.STUDENT

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    role: RoleEnum
    is_active: bool
    membership_date: date
    membership_expiry: Optional[date] = None
    max_books_allowed: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
