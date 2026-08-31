import io
import logging
from minio import Minio
from minio.error import S3Error
from app.core.config import settings

logger = logging.getLogger(__name__)

class S3StorageService:
    def __init__(self):
        # Parse endpoint from http://minio:9000 -> minio:9000
        endpoint = settings.S3_ENDPOINT.replace("http://", "").replace("https://", "")
        self.client = Minio(
            endpoint=endpoint,
            access_key=settings.S3_ACCESS_KEY,
            secret_key=settings.S3_SECRET_KEY,
            secure=settings.S3_SECURE
        )
        self.bucket = settings.S3_BUCKET

    def ensure_bucket_exists(self):
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                logger.info(f"Created MinIO bucket: {self.bucket}")
        except Exception as e:
            logger.warning(f"MinIO bucket check skipped/failed: {e}")

    def upload_file_bytes(self, s3_key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        self.ensure_bucket_exists()
        data_stream = io.BytesIO(data)
        self.client.put_object(
            bucket_name=self.bucket,
            object_name=s3_key,
            data=data_stream,
            length=len(data),
            content_type=content_type
        )
        return s3_key

    def download_file_bytes(self, s3_key: str) -> bytes:
        response = self.client.get_object(self.bucket, s3_key)
        try:
            return response.read()
        finally:
            response.close()
            response.release_conn()

    def get_presigned_url(self, s3_key: str, expires_seconds: int = 3600) -> str:
        return self.client.presigned_get_object(
            bucket_name=self.bucket,
            object_name=s3_key,
            expires=expires_seconds
        )

s3_service = S3StorageService()
