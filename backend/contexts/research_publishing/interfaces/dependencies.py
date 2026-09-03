from fastapi import Request
from app.infrastructure.db import db
from contexts.research_publishing.infrastructure.minio_adapter import MinIOStorage
from contexts.research_publishing.infrastructure.mongo_repository import MongoReportRepository
from contexts.research_publishing.application.use_cases import ResearchPublishingUseCases
from bootstrap.settings import settings

def get_report_storage() -> MinIOStorage:
    return MinIOStorage(
        endpoint=settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        bucket_name=settings.MINIO_BUCKET_NAME,
        secure=settings.MINIO_SECURE
    )

def get_report_repository(request: Request = None) -> MongoReportRepository:
    return MongoReportRepository(db.reports)

def get_research_use_cases(request: Request) -> ResearchPublishingUseCases:
    repo = get_report_repository(request)
    storage = get_report_storage()
    return ResearchPublishingUseCases(repo, storage)
