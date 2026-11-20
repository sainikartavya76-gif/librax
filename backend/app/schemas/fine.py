from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from .transaction import TransactionResponse

class FineResponse(BaseModel):
    id: UUID
    transaction_id: UUID
    user_id: UUID
    amount: Decimal
    days_overdue: int
    paid: bool
    paid_at: Optional[datetime] = None
    created_at: datetime
    transaction: Optional[TransactionResponse] = None

    class Config:
        from_attributes = True
