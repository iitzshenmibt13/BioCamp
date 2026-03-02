"""S3 / MinIO file upload utility."""
import uuid
import boto3
from botocore.client import Config
from fastapi import UploadFile

from app.config import settings

_s3_client = None


def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            config=Config(signature_version="s3v4"),
            region_name="us-east-1",
        )
        # Ensure bucket exists
        try:
            _s3_client.head_bucket(Bucket=settings.s3_bucket)
        except Exception:
            _s3_client.create_bucket(Bucket=settings.s3_bucket)
            _s3_client.put_bucket_policy(
                Bucket=settings.s3_bucket,
                Policy=f'{{"Version":"2012-10-17","Statement":[{{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::{settings.s3_bucket}/*"}}]}}',
            )
    return _s3_client


async def upload_file(file: UploadFile, folder: str = "uploads") -> str:
    """Upload a file to S3/MinIO and return the public URL."""
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    key = f"{folder}/{uuid.uuid4().hex}.{ext}"
    s3 = get_s3_client()
    content = await file.read()
    s3.put_object(
        Bucket=settings.s3_bucket,
        Key=key,
        Body=content,
        ContentType=file.content_type or "application/octet-stream",
    )
    return f"{settings.s3_public_base_url}/{key}"
