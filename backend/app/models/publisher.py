import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Publisher(Base):
    __tablename__ = "publishers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    address = Column(String, nullable=True)
    website = Column(String, nullable=True)

    books = relationship("Book", back_populates="publisher")
