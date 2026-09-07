import uuid
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(min_length=6)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower()


class UserOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None


class AuthStepResponse(BaseModel):
    user: UserOut
    otp_setup_required: bool
    otp_provisioning_uri: Optional[str] = None
    otp_secret: Optional[str] = None
    pending_token: str


class VerifyOtpRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6)


class VerifyRecoveryRequest(BaseModel):
    recovery_code: str


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class OtpSetupCompleteResponse(AccessTokenResponse):
    recovery_codes: list[str]