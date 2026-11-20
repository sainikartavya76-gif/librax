from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.reservation import Reservation, ReservationStatus
from app.repositories.base import BaseRepository
from typing import List, Optional

class ReservationRepository(BaseRepository[Reservation]):
    def __init__(self, db: AsyncSession):
        super().__init__(Reservation, db)

    async def get_queue_for_book(self, book_id: str) -> List[Reservation]:
        stmt = select(Reservation).where(
            Reservation.book_id == book_id,
            Reservation.status == ReservationStatus.PENDING
        ).order_by(Reservation.queue_position)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_next_pending(self, book_id: str) -> Optional[Reservation]:
        stmt = select(Reservation).where(
            Reservation.book_id == book_id,
            Reservation.status == ReservationStatus.PENDING
        ).order_by(Reservation.queue_position).limit(1)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
