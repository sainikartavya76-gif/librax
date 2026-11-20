from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.transaction import Transaction, TransactionStatus
from app.repositories.base import BaseRepository
from typing import List, Optional
from datetime import date

class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self, db: AsyncSession):
        super().__init__(Transaction, db)
        
    async def get_active_by_user(self, user_id: str) -> List[Transaction]:
        stmt = select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.status == TransactionStatus.ACTIVE
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_overdue(self, current_date: date) -> List[Transaction]:
        stmt = select(Transaction).where(
            Transaction.status == TransactionStatus.ACTIVE,
            Transaction.due_date < current_date
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()
