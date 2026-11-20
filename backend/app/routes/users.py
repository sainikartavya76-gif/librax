from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database.session import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.transaction import TransactionResponse
from app.schemas.fine import FineResponse
from app.services.user_service import UserService
from app.services.transaction_service import TransactionService
from app.core.dependencies import get_current_active_user, require_role
from app.models.user import RoleEnum, User
from sqlalchemy.future import select
from app.models.fine import Fine

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[UserResponse], dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
async def get_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    return await service.get_all(skip, limit)

@router.get("/{id}", response_model=UserResponse)
async def get_user(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if str(current_user.id) != id and current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    service = UserService(db)
    return await service.get_by_id(id)

@router.put("/{id}", response_model=UserResponse)
async def update_user(id: str, data: UserUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if str(current_user.id) != id and current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    service = UserService(db)
    return await service.update(id, data)

@router.delete("/{id}", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
async def delete_user(id: str, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    # Would need to implement delete in user_service.py
    return {"message": "User deletion not fully implemented"}

@router.get("/{id}/transactions", response_model=List[TransactionResponse])
async def get_user_transactions(id: str, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if str(current_user.id) != id and current_user.role not in [RoleEnum.ADMIN, RoleEnum.LIBRARIAN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    service = TransactionService(db)
    return await service.get_all_transactions(skip, limit, id)

@router.get("/{id}/fines", response_model=List[FineResponse])
async def get_user_fines(id: str, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if str(current_user.id) != id and current_user.role not in [RoleEnum.ADMIN, RoleEnum.LIBRARIAN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    stmt = select(Fine).where(Fine.user_id == id).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.patch("/{id}/activate", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
async def activate_user(id: str, db: AsyncSession = Depends(get_db)):
    return {"message": "Activation not fully implemented"}

@router.patch("/{id}/deactivate", dependencies=[Depends(require_role([RoleEnum.ADMIN]))])
async def deactivate_user(id: str, db: AsyncSession = Depends(get_db)):
    return {"message": "Deactivation not fully implemented"}
