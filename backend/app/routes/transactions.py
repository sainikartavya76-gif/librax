from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database.session import get_db
from app.schemas.transaction import TransactionResponse, TransactionIssue
from app.services.transaction_service import TransactionService
from app.core.dependencies import require_role, get_current_active_user
from app.models.user import RoleEnum, User

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("", response_model=List[TransactionResponse])
async def get_transactions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = TransactionService(db)
    if current_user.role == RoleEnum.STUDENT:
        return await service.get_all_transactions(skip, limit, str(current_user.id))
    return await service.get_all_transactions(skip, limit)

@router.get("/overdue", response_model=List[TransactionResponse], dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def get_overdue_transactions(db: AsyncSession = Depends(get_db)):
    service = TransactionService(db)
    return await service.get_overdue_transactions()

@router.get("/{id}", response_model=TransactionResponse)
async def get_transaction(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = TransactionService(db)
    tx = await service.get_transaction(id)
    if current_user.role == RoleEnum.STUDENT and str(tx.user_id) != str(current_user.id):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")
    return tx

@router.post("/issue", response_model=TransactionResponse, dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def issue_book(data: TransactionIssue, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = TransactionService(db)
    return await service.issue_book(str(data.book_id), str(data.user_id), str(current_user.id), data.notes)

@router.post("/return/{id}", response_model=TransactionResponse, dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def return_book(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    service = TransactionService(db)
    return await service.return_book(id, str(current_user.id))
