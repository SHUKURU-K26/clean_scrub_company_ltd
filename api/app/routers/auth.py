from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_db, get_pending_user, get_current_user
from app.models.user import User
from app.models.otp import OtpSecret, RecoveryCode
from app.schemas.auth import (
    SignupRequest, LoginRequest, AuthStepResponse, UserOut,
    VerifyOtpRequest, VerifyRecoveryRequest, AccessTokenResponse, OtpSetupCompleteResponse,
)
from app.services.security import hash_password, verify_password, create_token
from app.services.otp import (
    generate_secret, get_provisioning_uri, verify_totp_code,
    generate_recovery_codes, hash_recovery_code, verify_recovery_code,
)
from app.services.rate_limit import is_locked_out, record_failure, clear_attempts

router = APIRouter(prefix="/auth", tags=["auth"])

PENDING_TOKEN_EXPIRE_MINUTES = 15
LOCKOUT_MESSAGE = "Too many failed attempts. Please try again in 15 minutes."


@router.post("/signup", response_model=AuthStepResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.flush()

    secret = generate_secret()
    db.add(OtpSecret(user_id=user.id, secret=secret, is_active=False))

    db.commit()
    db.refresh(user)

    pending_token = create_token(str(user.id), scope="otp_pending", expires_minutes=PENDING_TOKEN_EXPIRE_MINUTES)

    return AuthStepResponse(
        user=UserOut.model_validate(user),
        otp_setup_required=True,
        otp_provisioning_uri=get_provisioning_uri(secret, user.email),
        otp_secret=secret,
        pending_token=pending_token,
    )


@router.post("/login", response_model=AuthStepResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    lockout_key = f"login:{payload.email.lower()}"
    if is_locked_out(lockout_key):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=LOCKOUT_MESSAGE)

    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        record_failure(lockout_key)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    clear_attempts(lockout_key)

    otp_secret = db.query(OtpSecret).filter(OtpSecret.user_id == user.id).first()
    pending_token = create_token(str(user.id), scope="otp_pending", expires_minutes=PENDING_TOKEN_EXPIRE_MINUTES)

    if not otp_secret or not otp_secret.is_active:
        secret = otp_secret.secret if otp_secret else generate_secret()
        if not otp_secret:
            db.add(OtpSecret(user_id=user.id, secret=secret, is_active=False))
            db.commit()

        return AuthStepResponse(
            user=UserOut.model_validate(user),
            otp_setup_required=True,
            otp_provisioning_uri=get_provisioning_uri(secret, user.email),
            otp_secret=secret,
            pending_token=pending_token,
        )

    return AuthStepResponse(
        user=UserOut.model_validate(user),
        otp_setup_required=False,
        pending_token=pending_token,
    )


@router.post("/otp/verify-setup", response_model=OtpSetupCompleteResponse)
def verify_otp_setup(
    payload: VerifyOtpRequest,
    user: User = Depends(get_pending_user),
    db: Session = Depends(get_db),
):
    lockout_key = f"otp:{user.id}"
    if is_locked_out(lockout_key):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=LOCKOUT_MESSAGE)

    otp_secret = db.query(OtpSecret).filter(OtpSecret.user_id == user.id).first()
    if not otp_secret:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No authenticator setup in progress")
    if otp_secret.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authenticator is already active")

    if not verify_totp_code(otp_secret.secret, payload.code):
        record_failure(lockout_key)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect code — check your authenticator app and try again")

    clear_attempts(lockout_key)
    otp_secret.is_active = True

    db.query(RecoveryCode).filter(RecoveryCode.user_id == user.id).delete()
    plain_codes = generate_recovery_codes(8)
    for code in plain_codes:
        db.add(RecoveryCode(user_id=user.id, code_hash=hash_recovery_code(code)))

    db.commit()

    access_token = create_token(str(user.id), scope="access", expires_minutes=settings.jwt_access_token_expire_minutes)

    return OtpSetupCompleteResponse(
        access_token=access_token,
        user=UserOut.model_validate(user),
        recovery_codes=plain_codes,
    )


@router.post("/otp/verify-login", response_model=AccessTokenResponse)
def verify_otp_login(
    payload: VerifyOtpRequest,
    user: User = Depends(get_pending_user),
    db: Session = Depends(get_db),
):
    lockout_key = f"otp:{user.id}"
    if is_locked_out(lockout_key):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=LOCKOUT_MESSAGE)

    otp_secret = db.query(OtpSecret).filter(OtpSecret.user_id == user.id).first()
    if not otp_secret or not otp_secret.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authenticator is not set up")

    if not verify_totp_code(otp_secret.secret, payload.code):
        record_failure(lockout_key)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect code — please try again")

    clear_attempts(lockout_key)
    access_token = create_token(str(user.id), scope="access", expires_minutes=settings.jwt_access_token_expire_minutes)
    return AccessTokenResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.post("/otp/verify-recovery", response_model=AccessTokenResponse)
def verify_recovery(
    payload: VerifyRecoveryRequest,
    user: User = Depends(get_pending_user),
    db: Session = Depends(get_db),
):
    lockout_key = f"otp:{user.id}"
    if is_locked_out(lockout_key):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=LOCKOUT_MESSAGE)

    codes = db.query(RecoveryCode).filter(
        RecoveryCode.user_id == user.id,
        RecoveryCode.used.is_(False),
    ).all()

    matched = None
    for rc in codes:
        if verify_recovery_code(payload.recovery_code.strip().upper(), rc.code_hash):
            matched = rc
            break

    if not matched:
        record_failure(lockout_key)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or already-used recovery code")

    clear_attempts(lockout_key)
    matched.used = True
    db.commit()

    access_token = create_token(str(user.id), scope="access", expires_minutes=settings.jwt_access_token_expire_minutes)
    return AccessTokenResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)