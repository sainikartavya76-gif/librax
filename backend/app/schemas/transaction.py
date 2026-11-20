from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from app.models.transaction import TransactionStatus
from .book import BookResponse

class TransactionBase(BaseModel):
    book_id: UUID
    user_id: UUID
    notes: Optional[str] = None

class TransactionIssue(TransactionBase):
    pass

class TransactionResponse(BaseModel):
    id: UUID
    book_id: UUID
    user_id: UUID
    issued_by: UUID
    issue_date: date
    due_date: date
    return_date: Optional[date] = None
    status: TransactionStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    book: Optional[BookResponse] = None

    class Config:
        from_attributes = True
