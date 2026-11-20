from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from typing import List
from app.database.session import get_db
from app.schemas.notification import NotificationResponse
from app.services.notification_service import NotificationService
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationResponse])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all notifications for the current user."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(desc(Notification.created_at))
        .limit(100)
    )
    return result.scalars().all()


@router.patch("/{id}/read", response_model=NotificationResponse)
async def mark_as_read(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Mark a single notification as read."""
    service = NotificationService(db)
    notif = await service.get_by_id(id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    if str(notif.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    return await service.mark_as_read(id)


@router.patch("/read-all", response_model=dict)
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Mark all of current user's notifications as read."""
    service = NotificationService(db)
    count = await service.mark_all_read(str(current_user.id))
    return {"marked_read": count}


@router.delete("/{id}")
async def delete_notification(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a notification."""
    service = NotificationService(db)
    notif = await service.get_by_id(id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    if str(notif.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    await service.delete(id)
    return {"message": "Notification deleted"}
