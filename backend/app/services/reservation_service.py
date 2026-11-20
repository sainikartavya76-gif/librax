from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from app.repositories.reservation_repo import ReservationRepository
from app.repositories.book_repo import BookRepository
from app.models.reservation import Reservation, ReservationStatus
from app.schemas.reservation import ReservationCreate


class ReservationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.reservation_repo = ReservationRepository(db)
        self.book_repo = BookRepository(db)

    async def get_all(self, skip: int = 0, limit: int = 100):
        """Get all reservations with book and user data."""
        result = await self.db.execute(
            select(Reservation)
            .options(selectinload(Reservation.book), selectinload(Reservation.user))
            .offset(skip)
            .limit(limit)
            .order_by(Reservation.created_at.desc())
        )
        return result.scalars().all()

    async def get_by_user(self, user_id: str):
        """Get reservations for a specific user."""
        result = await self.db.execute(
            select(Reservation)
            .options(selectinload(Reservation.book))
            .where(Reservation.user_id == user_id)
            .order_by(Reservation.created_at.desc())
        )
        return result.scalars().all()

    async def get_by_book(self, book_id: str):
        """Get the reservation queue for a specific book (PENDING only, ordered by position)."""
        result = await self.db.execute(
            select(Reservation)
            .options(selectinload(Reservation.user))
            .where(
                Reservation.book_id == book_id,
                Reservation.status == ReservationStatus.PENDING
            )
            .order_by(Reservation.queue_position)
        )
        return result.scalars().all()

    async def get_by_id(self, reservation_id: str):
        """Get a single reservation by ID."""
        result = await self.db.execute(
            select(Reservation)
            .options(selectinload(Reservation.book), selectinload(Reservation.user))
            .where(Reservation.id == reservation_id)
        )
        return result.scalars().first()

    async def create(self, user_id: str, data: ReservationCreate):
        """Create a new reservation for a book."""
        book = await self.book_repo.get(str(data.book_id))
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        if book.available_copies > 0:
            raise HTTPException(
                status_code=400,
                detail="Book is currently available — please issue it directly instead of reserving"
            )

        # Check if user already has a pending reservation for this book
        existing = await self.db.execute(
            select(Reservation).where(
                Reservation.book_id == data.book_id,
                Reservation.user_id == user_id,
                Reservation.status == ReservationStatus.PENDING
            )
        )
        if existing.scalars().first():
            raise HTTPException(status_code=400, detail="You already have a pending reservation for this book")

        queue = await self.reservation_repo.get_queue_for_book(str(data.book_id))
        queue_position = len(queue) + 1

        reservation = await self.reservation_repo.create({
            "book_id": str(data.book_id),
            "user_id": user_id,
            "queue_position": queue_position,
            "status": ReservationStatus.PENDING,
        })
        return reservation

    async def cancel(self, reservation_id: str):
        """Cancel a reservation and reorder queue."""
        reservation = await self.get_by_id(reservation_id)
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")

        cancelled = await self.reservation_repo.update(reservation_id, {
            "status": ReservationStatus.CANCELLED
        })

        # Reorder remaining positions
        remaining = await self.get_by_book(str(reservation.book_id))
        for idx, res in enumerate(remaining, start=1):
            await self.reservation_repo.update(str(res.id), {"queue_position": idx})

        return cancelled
