import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.database.connection import Base

class ReservationStatus(str, enum.Enum):
    PENDING = "PENDING"
    NOTIFIED = "NOTIFIED"
    CANCELLED = "CANCELLED"
    FULFILLED = "FULFILLED"

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    queue_position = Column(Integer, nullable=False)
    status = Column(Enum(ReservationStatus), default=ReservationStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    notified_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    book = relationship("Book", back_populates="reservations")
    user = relationship("User", back_populates="reservations")
