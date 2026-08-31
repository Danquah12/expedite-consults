import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import User, Attachment
from app.schemas.mail import AttachmentOut
from app.api.deps import get_current_user
from app.services.s3_service import s3_service

router = APIRouter()

@router.post("/upload")
async def upload_attachment(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    file_bytes = await file.read()
    s3_key = f"staging/{current_user.id}/{uuid.uuid4().hex}_{file.filename}"
    s3_service.upload_file_bytes(s3_key, file_bytes, file.content_type or "application/octet-stream")

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size_bytes": len(file_bytes),
        "s3_key": s3_key
    }

@router.get("/{attachment_id}/download")
async def download_attachment(
    attachment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Attachment).where(Attachment.id == attachment_id)
    )
    att = res.scalar_one_or_none()
    if not att:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")

    file_bytes = s3_service.download_file_bytes(att.s3_key)
    return Response(
        content=file_bytes,
        media_type=att.content_type,
        headers={"Content-Disposition": f'attachment; filename="{att.filename}"'}
    )
