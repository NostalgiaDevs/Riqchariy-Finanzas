import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    classroom_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
