from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from app.repositories.transaction_repo import TransactionRepository
from app.repositories.book_repo import BookRepository
from app.repositories.user_repo import UserRepository
from app.repositories.activity_log_repo import ActivityLogRepository
from app.repositories.notification_repo import NotificationRepository
from app.repositories.fine_repo import FineRepository
from app.repositories.reservation_repo import ReservationRepository
from app.models.transaction import Transaction, TransactionStatus
from app.models.notification import NotificationType
from app.models.reservation import ReservationStatus
from datetime import date, datetime
from app.core.config import settings

class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.transaction_repo = TransactionRepository(db)
        self.book_repo = BookRepository(db)
        self.user_repo = UserRepository(db)
        self.activity_repo = ActivityLogRepository(db)
        self.notification_repo = NotificationRepository(db)
        self.fine_repo = FineRepository(db)
        self.reservation_repo = ReservationRepository(db)

    async def get_all_transactions(self, skip: int = 0, limit: int = 100, user_id: str = None):
        stmt = select(Transaction).options(selectinload(Transaction.book))
        if user_id:
            stmt = stmt.where(Transaction.user_id == user_id)
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_overdue_transactions(self):
        return await self.transaction_repo.get_overdue(date.today())

    async def get_transaction(self, id: str):
        tx = await self.transaction_repo.get(id)
        if not tx:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return tx

    async def issue_book(self, book_id: str, user_id: str, issuer_id: str, notes: str = None):
        book = await self.book_repo.get(book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        if book.available_copies <= 0:
            raise HTTPException(status_code=400, detail="No copies available")

        user = await self.user_repo.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        active_txs = await self.transaction_repo.get_active_by_user(user_id)
        if len(active_txs) >= user.max_books_allowed:
            raise HTTPException(status_code=400, detail="Maximum books allowed reached")

        book.available_copies -= 1
        await self.book_repo.update(book_id, {"available_copies": book.available_copies})

        from datetime import timedelta
        issue_date = date.today()
        due_date = issue_date + timedelta(days=settings.MAX_BORROW_DAYS)

        tx = await self.transaction_repo.create({
            "book_id": book_id,
            "user_id": user_id,
            "issued_by": issuer_id,
            "issue_date": issue_date,
            "due_date": due_date,
            "status": TransactionStatus.ACTIVE,
            "notes": notes
        })

        await self.activity_repo.create({
            "user_id": issuer_id,
            "action": "ISSUE_BOOK",
            "entity_type": "Transaction",
            "entity_id": tx.id,
            "description": f"Issued book {book.title} to user {user.username}"
        })

        await self.notification_repo.create({
            "user_id": user_id,
            "title": "Book Issued",
            "message": f"You have been issued {book.title}. Due date: {due_date}",
            "type": NotificationType.SYSTEM
        })

        return tx

    async def return_book(self, transaction_id: str, receiver_id: str):
        tx = await self.transaction_repo.get(transaction_id)
        if not tx or tx.status == TransactionStatus.RETURNED:
            raise HTTPException(status_code=400, detail="Invalid or already returned transaction")

        return_date = date.today()
        days_overdue = (return_date - tx.due_date).days
        
        fine = None
        if days_overdue > 0:
            fine_amount = days_overdue * settings.FINE_PER_DAY
            fine = await self.fine_repo.create({
                "transaction_id": tx.id,
                "user_id": tx.user_id,
                "amount": fine_amount,
                "days_overdue": days_overdue
            })
            await self.notification_repo.create({
                "user_id": tx.user_id,
                "title": "Fine Generated",
                "message": f"A fine of ₹{fine_amount} has been generated for overdue book.",
                "type": NotificationType.FINE
            })

        await self.transaction_repo.update(tx.id, {
            "status": TransactionStatus.RETURNED,
            "return_date": return_date
        })

        book = await self.book_repo.get(tx.book_id)
        await self.book_repo.update(tx.book_id, {"available_copies": book.available_copies + 1})

        next_reservation = await self.reservation_repo.get_next_pending(tx.book_id)
        if next_reservation:
            await self.reservation_repo.update(next_reservation.id, {"status": ReservationStatus.NOTIFIED, "notified_at": datetime.utcnow()})
            await self.notification_repo.create({
                "user_id": next_reservation.user_id,
                "title": "Reserved Book Available",
                "message": f"The book '{book.title}' you reserved is now available. Please collect it within 48 hours.",
                "type": NotificationType.AVAILABLE
            })

        await self.activity_repo.create({
            "user_id": receiver_id,
            "action": "RETURN_BOOK",
            "entity_type": "Transaction",
            "entity_id": tx.id,
            "description": f"Returned book {book.title}"
        })

        return tx
