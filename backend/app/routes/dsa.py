from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from sqlalchemy.orm import selectinload
from typing import Optional
from app.database.session import get_db
from app.schemas.dsa import SearchResult, SortResult
from app.services.dsa_service import DsaService
from app.services.book_service import BookService
from app.models.activity_log import ActivityLog
from app.models.reservation import Reservation, ReservationStatus
from app.core.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/dsa", tags=["dsa"])


@router.get("/search", response_model=SearchResult)
async def search(
    q: str = Query(..., min_length=1),
    field: str = Query("title", pattern="^(title|isbn|author|category)$"),
    algorithm: str = Query("linear", pattern="^(linear|binary|hash|bst)$"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """
    Search books using a chosen algorithm.
    Returns results along with execution time, comparisons, and complexity info.
    """
    book_service = BookService(db)
    books = await book_service.get_all(0, 1000)
    books_data = [
        {
            "id": str(b.id),
            "title": b.title,
            "isbn": b.isbn,
            "author": ", ".join(a.name for a in b.authors) if b.authors else "",
            "category": b.category.name if b.category else "",
        }
        for b in books
    ]

    if algorithm == "binary":
        # Binary search requires sorted data
        books_data.sort(key=lambda x: str(x.get(field, "")).lower())

    return DsaService.search(books_data, field, q, algorithm)


@router.get("/sort", response_model=SortResult)
async def sort_data(
    field: str = Query("title", pattern="^(title|isbn)$"),
    algorithm: str = Query("bubble", pattern="^(bubble|selection|insertion|merge|quick|heap)$"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """
    Sort the book catalogue using a chosen algorithm.
    Returns sorted data along with comparisons, swaps, execution time, and complexity.
    """
    book_service = BookService(db)
    books = await book_service.get_all(0, limit)
    books_data = [
        {
            "id": str(b.id),
            "title": b.title,
            "isbn": b.isbn,
        }
        for b in books
    ]
    return DsaService.sort(books_data, field, algorithm)


@router.get("/visualize/queue")
async def visualize_queue(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """
    Get current reservation queue data for visualization.
    Returns all pending reservations grouped or listed for Queue DSA demo.
    """
    result = await db.execute(
        select(Reservation)
        .options(
            selectinload(Reservation.user),
            selectinload(Reservation.book),
        )
        .where(Reservation.status == ReservationStatus.PENDING)
        .order_by(Reservation.queue_position)
        .limit(50)
    )
    reservations = result.scalars().all()

    return {
        "type": "QUEUE",
        "algorithm": "FIFO (First-In, First-Out)",
        "description": "Reservation queue: students wait in order. First to reserve gets priority when a copy is returned.",
        "queue_length": len(reservations),
        "items": [
            {
                "position": res.queue_position,
                "reservation_id": str(res.id),
                "user_name": res.user.full_name if res.user else "Unknown",
                "user_email": res.user.email if res.user else "",
                "book_title": res.book.title if res.book else "Unknown",
                "book_isbn": res.book.isbn if res.book else "",
                "reserved_at": res.created_at.isoformat(),
                "status": res.status.value if hasattr(res.status, 'value') else str(res.status),
            }
            for res in reservations
        ],
    }


@router.get("/visualize/stack")
async def visualize_stack(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """
    Get recent librarian operations for Stack visualization.
    Returns last 10 operations as a stack (newest first = top of stack).
    """
    result = await db.execute(
        select(ActivityLog)
        .options(selectinload(ActivityLog.user))
        .where(
            ActivityLog.action.in_(["ISSUE_BOOK", "RETURN_BOOK", "ADD_BOOK", "UPDATE_BOOK", "DELETE_BOOK", "PAY_FINE"])
        )
        .order_by(desc(ActivityLog.created_at))
        .limit(10)
    )
    logs = result.scalars().all()

    return {
        "type": "STACK",
        "algorithm": "LIFO (Last-In, First-Out)",
        "description": "Operation stack: librarian actions are pushed onto the stack. Most recent operation is at the top.",
        "stack_size": len(logs),
        "items": [
            {
                "position": idx + 1,  # 1 = top of stack
                "operation": log.action,
                "description": log.description or "",
                "performed_by": log.user.full_name if log.user else "System",
                "timestamp": log.created_at.isoformat(),
            }
            for idx, log in enumerate(logs)
        ],
    }
