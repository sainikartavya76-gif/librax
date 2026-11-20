from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from app.repositories.book_repo import BookRepository
from app.models.book import Book
from app.models.transaction import Transaction
from app.schemas.book import BookCreate, BookUpdate

class BookService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.book_repo = BookRepository(db)

    async def get_all(self, skip: int = 0, limit: int = 100):
        return await self.book_repo.get_all_with_details(skip, limit)

    async def get_by_id(self, book_id: str):
        book = await self.book_repo.get_with_details(book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        return book

    async def search(self, q: str = None, field: str = None, category_id: str = None, available: bool = None, language: str = None, sort_by: str = None, sort_order: str = None, skip: int = 0, limit: int = 100):
        stmt = select(Book).options(selectinload(Book.category), selectinload(Book.publisher), selectinload(Book.authors))
        if q and field:
            if field == "title": stmt = stmt.where(Book.title.ilike(f"%{q}%"))
            elif field == "isbn": stmt = stmt.where(Book.isbn.ilike(f"%{q}%"))
        if category_id: stmt = stmt.where(Book.category_id == category_id)
        if language: stmt = stmt.where(Book.language == language)
        if available is not None:
            if available: stmt = stmt.where(Book.available_copies > 0)
            else: stmt = stmt.where(Book.available_copies == 0)
            
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_history(self, book_id: str):
        stmt = select(Transaction).where(Transaction.book_id == book_id).order_by(Transaction.issue_date.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create(self, data: BookCreate):
        book_data = data.model_dump(exclude={"author_ids"})
        book_data["available_copies"] = book_data["total_copies"]
        
        # NOTE: Real author handling would fetch Author models and append to book.authors.
        book = await self.book_repo.create(book_data)
        return book

    async def update(self, book_id: str, data: BookUpdate):
        book = await self.get_by_id(book_id)
        update_data = data.model_dump(exclude_unset=True)
        return await self.book_repo.update(book_id, update_data)

    async def delete(self, book_id: str):
        success = await self.book_repo.delete(book_id)
        if not success:
            raise HTTPException(status_code=404, detail="Book not found")
        return {"message": "Book deleted successfully"}
