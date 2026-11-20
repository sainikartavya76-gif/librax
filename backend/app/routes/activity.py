from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc
from app.database.session import get_db
from app.models.activity_log import ActivityLog
from app.models.user import User
from app.core.dependencies import require_role
from app.models.user import RoleEnum

router = APIRouter(prefix="/activity", tags=["activity"])

@router.get("")
async def get_activity(
    skip: int = 0, limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))
):
    result = await db.execute(
        select(ActivityLog)
        .options(selectinload(ActivityLog.user))
        .order_by(desc(ActivityLog.created_at))
        .offset(skip).limit(limit)
    )
    logs = result.scalars().all()
    return [
        {
            "id": str(log.id),
            "user_name": log.user.full_name if log.user else "System",
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": str(log.entity_id) if log.entity_id else None,
            "description": log.description,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]
