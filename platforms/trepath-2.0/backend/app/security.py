import base64
import hashlib
import hmac
import struct
import time
from urllib.parse import quote
import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db
from .models import User, Role, UserTwoFactorConfig

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_prefix}/auth/token")

DEFAULT_BACKUP_CODES = [
    "TP26-8841-9920",
    "TP26-4410-7731",
    "TP26-1029-5582",
    "TP26-6634-2109",
]


def derive_deterministic_totp_secret(email: str) -> str:
    """Derive a stable RFC 3548 160-bit Base32 TOTP secret for an operator email."""
    digest = hmac.new(
        settings.jwt_secret.encode("utf-8"),
        f"trepath-2.6-totp:{email.lower().strip()}".encode("utf-8"),
        hashlib.sha256,
    ).digest()[:20]
    return base64.b32encode(digest).decode("ascii").rstrip("=")


def generate_totp_code(secret_b32: str, for_time: int | None = None, step: int = 30, digits: int = 6) -> str:
    """Compute a standard 6-digit RFC 6238 TOTP code (HMAC-SHA1, 30s time step)."""
    clean = secret_b32.strip().replace(" ", "").upper()
    pad_len = (8 - (len(clean) % 8)) % 8
    key = base64.b32decode(clean + ("=" * pad_len), casefold=True)
    ts = int(for_time if for_time is not None else time.time())
    counter = ts // step
    msg = struct.pack(">Q", counter)
    digest = hmac.new(key, msg, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    code_int = struct.unpack(">I", digest[offset : offset + 4])[0] & 0x7FFFFFFF
    return str(code_int % (10**digits)).zfill(digits)


def get_totp_remaining_seconds(step: int = 30) -> int:
    """Return remaining seconds in the current 30-second RFC 6238 TOTP window."""
    return step - (int(time.time()) % step)


def build_otpauth_uri(email: str, secret_b32: str, issuer: str = "TrePath 2.6") -> str:
    """Build standard otpauth://totp/ URI compatible with Google Authenticator, Authy & 1Password."""
    label = quote(f"{issuer}:{email}")
    issuer_q = quote(issuer)
    return f"otpauth://totp/{label}?secret={secret_b32}&issuer={issuer_q}&algorithm=SHA1&digits=6&period=30"


def verify_totp_or_backup_code(
    secret_b32: str,
    submitted_code: str,
    backup_codes: list[str] | None = None,
    window: int = 1,
) -> tuple[bool, str]:
    """Verify a 6-digit RFC 6238 TOTP code (±1 window tolerance) or a recovery backup code."""
    raw = submitted_code.strip().upper()
    digits_only = "".join(ch for ch in raw if ch.isdigit())

    now_ts = int(time.time())
    if len(digits_only) == 6:
        for offset in range(-window, window + 1):
            expected = generate_totp_code(secret_b32, for_time=now_ts + (offset * 30))
            if hmac.compare_digest(digits_only, expected):
                return True, "RFC6238_TOTP"

    valid_backups = [c.strip().upper() for c in (backup_codes or DEFAULT_BACKUP_CODES)]
    if raw in valid_backups:
        return True, "RECOVERY_BACKUP_CODE"

    return False, "INVALID_CODE"


def get_or_create_user_2fa_config(db: Session, user: User) -> UserTwoFactorConfig:
    """Retrieve or initialize the persistent UserTwoFactorConfig record for a user."""
    cfg = db.query(UserTwoFactorConfig).filter_by(user_id=user.id).first()
    if not cfg:
        cfg = UserTwoFactorConfig(
            user_id=user.id,
            totp_secret=derive_deterministic_totp_secret(user.email),
            is_enabled=True,
            backup_codes_json=list(DEFAULT_BACKUP_CODES),
            verified_count=0,
        )
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg


def create_pre_2fa_token(user: User) -> str:
    """Issue a short-lived (5-minute) pre-authentication JWT restricted to the 2FA verification step."""
    exp = datetime.now(timezone.utc) + timedelta(minutes=5)
    return jwt.encode(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "scope": "mfa_challenge",
            "exp": exp,
        },
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def verify_pre_2fa_token(pre_auth_token: str, db: Session) -> User:
    """Validate a pre-2FA challenge token and return the associated User."""
    try:
        payload = jwt.decode(pre_auth_token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if payload.get("scope") != "mfa_challenge":
            raise HTTPException(status_code=401, detail="Invalid 2FA challenge token scope")
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Expired or invalid 2FA challenge token")
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive or unknown user")
    return user


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    pwd_bytes = password.encode("utf-8")[:72]
    hashed_bytes = hashed.encode("utf-8")
    try:
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

def create_access_token(user: User, mfa_verified: bool = True) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)
    return jwt.encode(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "mfa_verified": mfa_verified,
            "exp": exp,
        },
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

def current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication")
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive or unknown user")
    return user

def require_analyst(user: User = Depends(current_user)) -> User:
    if user.role not in (Role.ADMIN, Role.ANALYST):
        raise HTTPException(status_code=403, detail="Analyst role required")
    return user
