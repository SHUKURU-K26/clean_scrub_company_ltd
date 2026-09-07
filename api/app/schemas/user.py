from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field, field_validator


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: Optional[str]) -> Optional[str]:
        return v.lower() if v else v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


class RecoveryCodesResponse(BaseModel):
    recovery_codes: List[str]


class RecoveryCodesCountResponse(BaseModel):
    remaining: int


class MessageResponse(BaseModel):
    message: str