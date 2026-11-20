from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.notification import NotificationType

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True
