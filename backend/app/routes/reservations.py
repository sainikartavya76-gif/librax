from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database.session import get_db
from app.schemas.reservation import ReservationResponse, ReservationCreate
from app.services.reservation_service import ReservationService
from app.core.dependencies import get_current_active_user, require_role
from app.models.user import User, RoleEnum

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.get("", response_model=List[ReservationResponse])
async def get_reservations(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get reservations. ADMIN/LIBRARIAN see all; STUDENT sees own."""
    service = ReservationService(db)
    if current_user.role == RoleEnum.STUDENT:
        return await service.get_by_user(str(current_user.id))
    return await service.get_all(skip=skip, limit=limit)


@router.get("/book/{book_id}", response_model=List[ReservationResponse])
async def get_book_queue(
    book_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """Get reservation queue for a specific book."""
    service = ReservationService(db)
    return await service.get_by_book(book_id)


@router.get("/{id}", response_model=ReservationResponse)
async def get_reservation(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = ReservationService(db)
    reservation = await service.get_by_id(id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if current_user.role == RoleEnum.STUDENT and str(reservation.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    return reservation


@router.post("", response_model=ReservationResponse)
async def create_reservation(
    data: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = ReservationService(db)
    return await service.create(str(current_user.id), data)


@router.delete("/{id}")
async def cancel_reservation(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Cancel a reservation. Users can cancel their own; ADMIN can cancel any."""
    service = ReservationService(db)
    reservation = await service.get_by_id(id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if current_user.role == RoleEnum.STUDENT and str(reservation.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this reservation")
    return await service.cancel(id)
