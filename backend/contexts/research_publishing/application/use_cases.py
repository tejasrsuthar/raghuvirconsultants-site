import io
from typing import BinaryIO, List, Tuple
from contexts.research_publishing.domain.entities import Report, ReportStatus
from contexts.research_publishing.domain.ports import ReportRepository, ReportStorage
from contexts.research_publishing.domain.events import ReportPublishedEvent
from contexts.research_publishing.infrastructure.minio_adapter import PDFWatermarker
from contexts.identity.domain.entities import Investor
from events.dispatcher import dispatcher
import mimetypes
import uuid

class ResearchPublishingUseCases:
    def __init__(self, report_repo: ReportRepository, report_storage: ReportStorage):
        self.report_repo = report_repo
        self.report_storage = report_storage

    def upload_draft(self, title: str, content: str, file_obj: BinaryIO, filename: str, summary: str = None, plan_tier: str = "reports_yearly", parent_report_id: str = None) -> Report:
        """Creates a draft report and uploads the file to storage."""
        ext = filename.split(".")[-1] if "." in filename else "pdf"
        object_name = f"reports/{uuid.uuid4()}.{ext}"
        content_type = mimetypes.guess_type(filename)[0] or "application/pdf"
        
        storage_key = self.report_storage.upload(file_obj, object_name, content_type)
        
        report = Report(
            title=title,
            content=content,
            summary=summary,
            plan_tier_required=plan_tier,
            storage_key=storage_key,
            original_filename=filename,
            parent_report_id=parent_report_id
        )
        
        self.report_repo.save(report)
        return report
        
    def publish_report(self, report_id: str) -> Report:
        """Publishes a draft report."""
        report = self.report_repo.get_by_id(report_id)
        if not report:
            raise ValueError("Report not found")
            
        report.publish()
        self.report_repo.save(report)
        
        # Dispatch event
        event = ReportPublishedEvent(
            report_id=report.id,
            title=report.title,
            plan_tier_required=report.plan_tier_required,
            is_addendum=bool(report.parent_report_id),
            parent_report_id=report.parent_report_id
        )
        dispatcher.dispatch(event)
        
        return report

    def get_published_reports(self, skip: int = 0, limit: int = 100) -> List[Report]:
        return self.report_repo.find_published(skip=skip, limit=limit)
        
    def get_all_reports(self, skip: int = 0, limit: int = 100) -> List[Report]:
        return self.report_repo.find_all(skip=skip, limit=limit)

    def download_report(self, report_id: str, investor: Investor) -> Tuple[BinaryIO, str]:
        """
        Validates access, downloads the report, applies a watermark for the investor,
        and returns the watermarked file buffer and filename.
        """
        report = self.report_repo.get_by_id(report_id)
        if not report:
            raise ValueError("Report not found")
            
        if report.status != ReportStatus.PUBLISHED:
            raise ValueError("Report is not published yet")

        # In a full implementation, we'd check if the investor has an active subscription 
        # meeting `report.plan_tier_required`. For this phase, we assume the router layer checks access.
        
        if not report.storage_key:
            raise ValueError("Report has no attached document")

        # Download from storage
        raw_pdf_buffer = self.report_storage.download(report.storage_key)
        
        # Apply Watermark
        watermark_text = f"CONFIDENTIAL - {investor.name} ({investor.email}) - {investor.id.value}"
        watermarked_buffer = PDFWatermarker.apply_watermark(raw_pdf_buffer, watermark_text)
        
        filename = report.original_filename or f"{report.title}.pdf"
        return watermarked_buffer, filename
