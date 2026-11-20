from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    color_code: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: UUID

    class Config:
        from_attributes = True

class PublisherBase(BaseModel):
    name: str
    address: Optional[str] = None
    website: Optional[str] = None

class PublisherResponse(PublisherBase):
    id: UUID

    class Config:
        from_attributes = True

class AuthorBase(BaseModel):
    name: str
    bio: Optional[str] = None

class AuthorResponse(AuthorBase):
    id: UUID

    class Config:
        from_attributes = True

class BookBase(BaseModel):
    isbn: str
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    language: str = "English"
    pages: Optional[int] = None
    edition: Optional[str] = None
    publication_year: Optional[int] = None
    total_copies: int
    shelf_location: Optional[str] = None
    cover_image_url: Optional[str] = None
    category_id: Optional[UUID] = None
    publisher_id: Optional[UUID] = None

class BookCreate(BookBase):
    author_ids: List[UUID] = []

class BookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None

class BookResponse(BookBase):
    id: UUID
    available_copies: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    publisher: Optional[PublisherResponse] = None
    authors: List[AuthorResponse] = []

    class Config:
        from_attributes = True
