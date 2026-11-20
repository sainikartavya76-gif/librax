from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from app.database.session import get_db
from app.schemas.analytics import DashboardStats, ChartData
from app.services.analytics_service import AnalyticsService
from app.core.dependencies import require_role
from app.models.user import RoleEnum

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=DashboardStats, dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    service = AnalyticsService(db)
    return await service.get_dashboard_stats()

@router.get("/charts/issuance", response_model=ChartData, dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def get_issuance_chart(days: int = 30, db: AsyncSession = Depends(get_db)):
    service = AnalyticsService(db)
    return await service.get_issuance_chart(days)

@router.get("/charts/categories", response_model=ChartData, dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def get_categories_chart(db: AsyncSession = Depends(get_db)):
    service = AnalyticsService(db)
    return await service.get_categories_chart()

@router.get("/charts/fines", response_model=ChartData, dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def get_fines_chart(days: int = 30, db: AsyncSession = Depends(get_db)):
    service = AnalyticsService(db)
    return await service.get_fines_chart(days)

@router.get("/top-books", dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def get_top_books(limit: int = 10, db: AsyncSession = Depends(get_db)):
    service = AnalyticsService(db)
    return await service.get_top_books(limit)

@router.get("/member-activity", dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def get_member_activity(db: AsyncSession = Depends(get_db)):
    from sqlalchemy.future import select
    from sqlalchemy import func, desc
    from app.models.user import User
    from app.models.transaction import Transaction
    
    result = await db.execute(
        select(User.id, User.username, func.count(Transaction.id).label('borrow_count'))
        .join(Transaction, Transaction.user_id == User.id)
        .group_by(User.id)
        .order_by(desc('borrow_count'))
        .limit(10)
    )
    return [{"user_id": str(r.id), "username": r.username, "borrow_count": r.borrow_count} for r in result.all()]
