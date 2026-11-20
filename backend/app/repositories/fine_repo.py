from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.fine import Fine
from app.repositories.base import BaseRepository

class FineRepository(BaseRepository[Fine]):
    def __init__(self, db: AsyncSession):
        super().__init__(Fine, db)
