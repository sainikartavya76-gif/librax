from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from fastapi import HTTPException
from app.repositories.notification_repo import NotificationRepository
from app.models.notification import Notification
from datetime import datetime


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.notification_repo = NotificationRepository(db)

    async def get_all(self):
        return await self.notification_repo.get_all()

    async def get_by_id(self, notification_id: str):
        return await self.notification_repo.get(notification_id)

    async def get_for_user(self, user_id: str):
        """Get all notifications for a specific user, newest first."""
        result = await self.db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(100)
        )
        return result.scalars().all()

    async def mark_as_read(self, notification_id: str):
        notification = await self.notification_repo.get(notification_id)
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        return await self.notification_repo.update(notification_id, {
            "is_read": True,
            "read_at": datetime.utcnow()
        })

    async def mark_all_read(self, user_id: str) -> int:
        """Mark all unread notifications for a user as read. Returns count updated."""
        result = await self.db.execute(
            update(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
            .values(is_read=True, read_at=datetime.utcnow())
        )
        await self.db.commit()
        return result.rowcount

    async def delete(self, notification_id: str) -> bool:
        return await self.notification_repo.delete(notification_id)

    async def create(self, data: dict) -> Notification:
        return await self.notification_repo.create(data)
