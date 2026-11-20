from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, extract, desc
from sqlalchemy.orm import selectinload
from app.models.book import Book
from app.models.user import User
from app.models.transaction import Transaction, TransactionStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.fine import Fine
from app.models.activity_log import ActivityLog
from app.models.category import Category
from datetime import date, datetime, timedelta

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_stats(self):
        total_books_result = await self.db.execute(select(func.count(Book.id)))
        total_books = total_books_result.scalar() or 0

        total_users_result = await self.db.execute(select(func.count(User.id)))
        total_users = total_users_result.scalar() or 0

        today = date.today()
        current_month = today.month
        current_year = today.year
        
        books_issued_today_result = await self.db.execute(
            select(func.count(Transaction.id)).where(Transaction.issue_date == today)
        )
        books_issued_today = books_issued_today_result.scalar() or 0

        books_returned_today_result = await self.db.execute(
            select(func.count(Transaction.id)).where(
                Transaction.return_date == today,
                Transaction.status == TransactionStatus.RETURNED
            )
        )
        books_returned_today = books_returned_today_result.scalar() or 0

        overdue_txs = await self.db.execute(
            select(Transaction).options(
                selectinload(Transaction.book),
                selectinload(Transaction.user)
            ).where(
                Transaction.status == TransactionStatus.ACTIVE,
                Transaction.due_date < today
            ).order_by(Transaction.due_date)
        )
        overdue_txs_list = overdue_txs.scalars().all()
        overdue_count = len(overdue_txs_list)

        active_reservations_result = await self.db.execute(
            select(func.count(Reservation.id)).where(Reservation.status == ReservationStatus.PENDING)
        )
        active_reservations = active_reservations_result.scalar() or 0

        fines_collected_today_result = await self.db.execute(
            select(func.sum(Fine.amount)).where(
                Fine.paid == True,
                func.date(Fine.paid_at) == today
            )
        )
        fines_collected_today = fines_collected_today_result.scalar() or 0.0

        books_added_this_month_result = await self.db.execute(
            select(func.count(Book.id)).where(
                extract('month', Book.created_at) == current_month,
                extract('year', Book.created_at) == current_year
            )
        )
        books_added_this_month = books_added_this_month_result.scalar() or 0

        new_members_this_month_result = await self.db.execute(
            select(func.count(User.id)).where(
                extract('month', User.created_at) == current_month,
                extract('year', User.created_at) == current_year
            )
        )
        new_members_this_month = new_members_this_month_result.scalar() or 0

        # Recent activity
        activity_result = await self.db.execute(
            select(ActivityLog).options(selectinload(ActivityLog.user)).order_by(desc(ActivityLog.created_at)).limit(10)
        )
        recent_activity = [
            {
                "id": str(log.id),
                "action": log.action,
                "entity_type": log.entity_type,
                "description": log.description,
                "created_at": log.created_at.isoformat(),
                "user_name": log.user.username if log.user else "System"
            }
            for log in activity_result.scalars()
        ]

        # Overdue books list
        overdue_books = [
            {
                "transaction_id": str(tx.id),
                "book_title": tx.book.title,
                "user_name": tx.user.username,
                "due_date": tx.due_date.isoformat(),
                "days_overdue": (today - tx.due_date).days
            }
            for tx in overdue_txs_list[:10]
        ]

        # Popular books
        popular_books_result = await self.db.execute(
            select(Book.id, Book.title, func.count(Transaction.id).label('issue_count'))
            .join(Transaction, Transaction.book_id == Book.id)
            .group_by(Book.id)
            .order_by(desc('issue_count'))
            .limit(5)
        )
        popular_books = [
            {"book_id": str(row.id), "title": row.title, "issue_count": row.issue_count}
            for row in popular_books_result.all()
        ]

        # Popular categories
        categories_result = await self.db.execute(
            select(Category.id, Category.name, func.count(Book.id).label('book_count'))
            .outerjoin(Book, Book.category_id == Category.id)
            .group_by(Category.id)
            .order_by(desc('book_count'))
        )
        popular_categories = [
            {"category_id": str(row.id), "category_name": row.name, "count": row.book_count}
            for row in categories_result.all()
        ]

        return {
            "total_books": total_books,
            "total_users": total_users,
            "books_issued_today": books_issued_today,
            "books_returned_today": books_returned_today,
            "overdue_count": overdue_count,
            "active_reservations": active_reservations,
            "fines_collected_today": float(fines_collected_today),
            "books_added_this_month": books_added_this_month,
            "new_members_this_month": new_members_this_month,
            "recent_activity": recent_activity,
            "overdue_books": overdue_books,
            "popular_books": popular_books,
            "popular_categories": popular_categories
        }

    async def get_issuance_chart(self, days: int = 30):
        start_date = date.today() - timedelta(days=days)
        result = await self.db.execute(
            select(Transaction.issue_date, func.count(Transaction.id))
            .where(Transaction.issue_date >= start_date)
            .group_by(Transaction.issue_date)
            .order_by(Transaction.issue_date)
        )
        
        dates_map = {row[0].isoformat(): row[1] for row in result.all()}
        labels = []
        data = []
        for i in range(days + 1):
            d = (start_date + timedelta(days=i)).isoformat()
            labels.append(d)
            data.append(dates_map.get(d, 0))
            
        return {"labels": labels, "data": data}

    async def get_categories_chart(self):
        result = await self.db.execute(
            select(Category.name, func.count(Book.id))
            .join(Book, Book.category_id == Category.id)
            .group_by(Category.name)
        )
        labels = []
        data = []
        for row in result.all():
            labels.append(row[0])
            data.append(row[1])
        return {"labels": labels, "data": data}

    async def get_fines_chart(self, days: int = 30):
        start_date = datetime.utcnow() - timedelta(days=days)
        result = await self.db.execute(
            select(func.date(Fine.paid_at).label("day"), func.sum(Fine.amount))
            .where(Fine.paid == True, Fine.paid_at >= start_date)
            .group_by("day")
            .order_by("day")
        )
        dates_map = {row[0].isoformat(): float(row[1]) for row in result.all() if row[0]}
        
        labels = []
        data = []
        start_d = date.today() - timedelta(days=days)
        for i in range(days + 1):
            d = (start_d + timedelta(days=i)).isoformat()
            labels.append(d)
            data.append(dates_map.get(d, 0.0))
            
        return {"labels": labels, "data": data}

    async def get_top_books(self, limit: int = 10):
        result = await self.db.execute(
            select(Book.id, Book.title, Book.isbn, func.count(Transaction.id).label('issue_count'))
            .join(Transaction, Transaction.book_id == Book.id)
            .group_by(Book.id)
            .order_by(desc('issue_count'))
            .limit(limit)
        )
        return [
            {"id": str(row.id), "title": row.title, "isbn": row.isbn, "issue_count": row.issue_count}
            for row in result.all()
        ]
