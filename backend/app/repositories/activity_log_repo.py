from sqlalchemy.ext.asyncio import AsyncSession
from app.models.activity_log import ActivityLog
from app.repositories.base import BaseRepository

class ActivityLogRepository(BaseRepository[ActivityLog]):
    def __init__(self, db: AsyncSession):
        super().__init__(ActivityLog, db)
