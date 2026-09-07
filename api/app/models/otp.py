import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class OtpSecret(Base):
    __tablename__ = "otp_secrets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    # TOTP secret — base32 encoded, same format your frontend's otpauth
    # library already expects. This never leaves the server after setup.
    secret = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)  # False until first code is confirmed

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="otp_secret")


class RecoveryCode(Base):
    __tablename__ = "recovery_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Stored hashed, never plain text — same principle as passwords
    code_hash = Column(String, nullable=False)
    used = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="recovery_codes")