from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.fine import FineResponse
from app.services.fine_service import FineService
from app.core.dependencies import require_role
from app.models.user import RoleEnum

router = APIRouter(prefix="/fines", tags=["fines"])

@router.patch("/{id}/pay", response_model=FineResponse, dependencies=[Depends(require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN]))])
async def pay_fine(id: str, db: AsyncSession = Depends(get_db)):
    service = FineService(db)
    return await service.pay_fine(id)
