from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.otp import OtpSecret, RecoveryCode
from app.schemas.auth import UserOut
from app.schemas.user import (
    ProfileUpdate, ChangePasswordRequest, RecoveryCodesResponse,
    RecoveryCodesCountResponse, MessageResponse,
)
from app.services.security import hash_password, verify_password
from app.services.otp import generate_secret, generate_recovery_codes, hash_recovery_code

router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(get_current_user)])


@router.get("/me", response_model=UserOut)
def get_profile(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)


@router.put("/me", response_model=UserOut)
def update_profile(payload: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    updates = payload.model_dump(exclude_unset=True)

    if "email" in updates and updates["email"] != user.email:
        clash = db.query(User).filter(User.email == updates["email"]).first()
        if clash:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This email is already in use")

    for field, value in updates.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.post("/me/change-password", response_model=MessageResponse)
def change_password(payload: ChangePasswordRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different from your current password")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return MessageResponse(message="Password updated successfully")


@router.post("/me/reset-authenticator", response_model=MessageResponse)
def reset_authenticator(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(RecoveryCode).filter(RecoveryCode.user_id == user.id).delete()
    otp_secret = db.query(OtpSecret).filter(OtpSecret.user_id == user.id).first()

    if otp_secret:
        otp_secret.secret = generate_secret()
        otp_secret.is_active = False
    else:
        db.add(OtpSecret(user_id=user.id, secret=generate_secret(), is_active=False))

    db.commit()
    return MessageResponse(message="Authenticator reset — set it up again on your next login")


@router.post("/me/regenerate-recovery-codes", response_model=RecoveryCodesResponse)
def regenerate_recovery_codes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    otp_secret = db.query(OtpSecret).filter(OtpSecret.user_id == user.id).first()
    if not otp_secret or not otp_secret.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authenticator must be set up before generating recovery codes")

    db.query(RecoveryCode).filter(RecoveryCode.user_id == user.id).delete()
    plain_codes = generate_recovery_codes(8)
    for code in plain_codes:
        db.add(RecoveryCode(user_id=user.id, code_hash=hash_recovery_code(code)))
    db.commit()

    return RecoveryCodesResponse(recovery_codes=plain_codes)


@router.get("/me/recovery-codes-count", response_model=RecoveryCodesCountResponse)
def get_recovery_codes_count(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    remaining = db.query(RecoveryCode).filter(
        RecoveryCode.user_id == user.id,
        RecoveryCode.used.is_(False),
    ).count()
    return RecoveryCodesCountResponse(remaining=remaining)