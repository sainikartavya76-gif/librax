from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserUpdate

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def get_all(self, skip: int = 0, limit: int = 100):
        return await self.user_repo.get_all(skip, limit)

    async def get_by_id(self, user_id: str):
        user = await self.user_repo.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    async def update(self, user_id: str, data: UserUpdate):
        update_data = data.model_dump(exclude_unset=True)
        return await self.user_repo.update(user_id, update_data)
