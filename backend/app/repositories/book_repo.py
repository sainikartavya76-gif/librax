from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.book import Book
from app.repositories.base import BaseRepository
from typing import List, Optional

class BookRepository(BaseRepository[Book]):
    def __init__(self, db: AsyncSession):
        super().__init__(Book, db)
        
    async def get_with_details(self, id: str) -> Optional[Book]:
        stmt = select(Book).options(
            selectinload(Book.category),
            selectinload(Book.publisher),
            selectinload(Book.authors)
        ).where(Book.id == id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_with_details(self, skip: int = 0, limit: int = 100) -> List[Book]:
        stmt = select(Book).options(
            selectinload(Book.category),
            selectinload(Book.publisher),
            selectinload(Book.authors)
        ).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()
