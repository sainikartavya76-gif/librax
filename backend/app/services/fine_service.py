from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.repositories.fine_repo import FineRepository
from datetime import datetime

class FineService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.fine_repo = FineRepository(db)

    async def pay_fine(self, fine_id: str):
        fine = await self.fine_repo.get(fine_id)
        if not fine:
            raise HTTPException(status_code=404, detail="Fine not found")
        if fine.paid:
            raise HTTPException(status_code=400, detail="Fine already paid")
        
        return await self.fine_repo.update(fine_id, {
            "paid": True,
            "paid_at": datetime.utcnow()
        })
