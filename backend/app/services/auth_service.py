from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.schemas.auth import LoginRequest, RegisterRequest
from app.models.user import User, RoleEnum
from app.repositories.user_repo import UserRepository
from app.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, data: RegisterRequest) -> User:
        existing_user = await self.user_repo.get_by_email(data.email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
        existing_username = await self.user_repo.get_by_username(data.username)
        if existing_username:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

        user_data = data.model_dump()
        user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
        user_data["role"] = RoleEnum.STUDENT

        user = await self.user_repo.create(user_data)
        return user

    async def login(self, data: LoginRequest) -> dict:
        user = await self.user_repo.get_by_email(data.email_or_username)
        if not user:
            user = await self.user_repo.get_by_username(data.email_or_username)
            
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")

        access_token = create_access_token(subject=user.id)
        return {"access_token": access_token, "token_type": "bearer"}
