import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.connection import Base
from app.models.book_author import book_authors

class Book(Base):
    __tablename__ = "books"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    isbn = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, index=True, nullable=False)
    subtitle = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    language = Column(String, default="English")
    pages = Column(Integer, nullable=True)
    edition = Column(String, nullable=True)
    publication_year = Column(Integer, nullable=True)
    total_copies = Column(Integer, nullable=False, default=1)
    available_copies = Column(Integer, nullable=False, default=1)
    shelf_location = Column(String, nullable=True)
    cover_image_url = Column(String, nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    publisher_id = Column(UUID(as_uuid=True), ForeignKey("publishers.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="books")
    publisher = relationship("Publisher", back_populates="books")
    authors = relationship("Author", secondary=book_authors, back_populates="books")
    transactions = relationship("Transaction", back_populates="book")
    reservations = relationship("Reservation", back_populates="book")
