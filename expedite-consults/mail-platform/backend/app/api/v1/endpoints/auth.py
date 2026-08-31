from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import User, Domain
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserProfile
from app.core.security import get_password_hash, verify_password, create_access_token
from app.services.mail_service import mail_service
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register_user(
    data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    # Check if email exists
    existing = await db.execute(select(User).where(User.email == data.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    # Extract domain or create default
    domain_name = data.email.split("@")[-1].lower()
    domain_res = await db.execute(select(Domain).where(Domain.name == domain_name))
    domain = domain_res.scalar_one_or_none()
    if not domain:
        domain = Domain(name=domain_name, is_active=True)
        db.add(domain)
        await db.flush()

    new_user = User(
        domain_id=domain.id,
        email=data.email.lower(),
        password_hash=get_password_hash(data.password),
        display_name=data.display_name or data.email.split("@")[0].capitalize(),
        recovery_email=data.recovery_email,
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Initialize default mailboxes (Inbox, Sent, Starred, Drafts, Trash, Spam)
    await mail_service.initialize_user_mailboxes(db, new_user.id)

    token = create_access_token(subject=new_user.id, email=new_user.email)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=new_user.id,
        email=new_user.email,
        display_name=new_user.display_name
    )

@router.post("/login", response_model=TokenResponse)
async def login_user(
    data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(User).where(User.email == data.email.lower()))
    user = res.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended or deactivated"
        )

    token = create_access_token(subject=user.id, email=user.email)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        display_name=user.display_name
    )

@router.get("/me", response_model=UserProfile)
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user
