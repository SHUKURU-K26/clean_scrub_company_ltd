import secrets
import string

import pyotp

from app.services.security import hash_password, verify_password

ISSUER_NAME = "Clean & Scrub"


def generate_secret() -> str:
    return pyotp.random_base32()


def get_provisioning_uri(secret: str, email: str) -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name=ISSUER_NAME)


def verify_totp_code(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)  # allows ±30s clock drift, same as your frontend logic did


def generate_recovery_codes(count: int = 8) -> list[str]:
    alphabet = string.ascii_uppercase + string.digits
    codes = []
    for _ in range(count):
        part_a = "".join(secrets.choice(alphabet) for _ in range(4))
        part_b = "".join(secrets.choice(alphabet) for _ in range(4))
        codes.append(f"{part_a}-{part_b}")
    return codes


# Recovery codes are hashed with the same bcrypt infra as passwords —
# they function as backup passwords, so they get the same protection
def hash_recovery_code(code: str) -> str:
    return hash_password(code)


def verify_recovery_code(code: str, code_hash: str) -> bool:
    return verify_password(code, code_hash)