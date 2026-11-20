from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.reservation import ReservationStatus
from .book import BookResponse

class ReservationCreate(BaseModel):
    book_id: UUID

class ReservationResponse(BaseModel):
    id: UUID
    book_id: UUID
    user_id: UUID
    queue_position: int
    status: ReservationStatus
    created_at: datetime
    notified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    book: Optional[BookResponse] = None

    class Config:
        from_attributes = True
