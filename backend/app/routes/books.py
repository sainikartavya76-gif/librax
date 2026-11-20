from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database.session import get_db
from app.schemas.book import BookCreate, BookUpdate, BookResponse
from app.schemas.transaction import TransactionResponse
from app.services.book_service import BookService
from app.core.dependencies import get_current_user, require_role
from app.models.user import RoleEnum

router = APIRouter(prefix="/books", tags=["books"])

@router.get("", response_model=List[BookResponse])
async def get_books(skip: int = 0, limit: int = 100, search: Optional[str] = None, category_id: Optional[str] = None, available: Optional[bool] = None, language: Optional[str] = None, sort_by: Optional[str] = None, sort_order: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    service = BookService(db)
    if any([search, category_id, available is not None, language, sort_by]):
        return await service.search(search, "title" if search else None, category_id, available, language, sort_by, sort_order, skip, limit)
    return await service.get_all(skip=skip, limit=limit)

@router.get("/search", response_model=List[BookResponse])
async def search_books(q: str, field: str = "title", category_id: Optional[str] = None, available: Optional[bool] = None, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    service = BookService(db)
    return await service.search(q, field, category_id, available, None, None, None, skip, limit)

@router.get("/{id}", response_model=BookResponse)
async def get_book(id: str, db: AsyncSession = Depends(get_db)):
    service = BookService(db)
    return await service.get_by_id(id)

@router.get("/{id}/history", response_model=List[TransactionResponse], dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def get_book_history(id: str, db: AsyncSession = Depends(get_db)):
    service = BookService(db)
    return await service.get_history(id)

@router.post("", response_model=BookResponse, dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def create_book(data: BookCreate, db: AsyncSession = Depends(get_db)):
    service = BookService(db)
    return await service.create(data)

@router.put("/{id}", response_model=BookResponse, dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def update_book(id: str, data: BookUpdate, db: AsyncSession = Depends(get_db)):
    service = BookService(db)
    return await service.update(id, data)

@router.delete("/{id}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
async def delete_book(id: str, db: AsyncSession = Depends(get_db)):
    service = BookService(db)
    return await service.delete(id)
