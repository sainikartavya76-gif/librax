from sqlalchemy import Column, Table, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base

book_authors = Table(
    "book_authors",
    Base.metadata,
    Column("book_id", UUID(as_uuid=True), ForeignKey("books.id"), primary_key=True),
    Column("author_id", UUID(as_uuid=True), ForeignKey("authors.id"), primary_key=True)
)
