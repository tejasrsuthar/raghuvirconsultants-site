from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from typing import List, Optional
from pydantic import BaseModel
from contexts.research_publishing.application.use_cases import ResearchPublishingUseCases
from contexts.research_publishing.interfaces.dependencies import get_research_use_cases
from contexts.identity.interfaces.dependencies import get_current_investor, require_permission
from contexts.identity.domain.entities import Investor

router = APIRouter(prefix="/reports", tags=["Research Publishing"])

class ReportResponse(BaseModel):
    id: str
    title: str
    summary: str | None
    plan_tier_required: str
    status: str
    parent_report_id: str | None
    published_at: str | None
    created_at: str

@router.post("/admin/upload", response_model=ReportResponse)
async def upload_draft_report(
    title: str = Form(...),
    summary: str = Form(None),
    plan_tier: str = Form("reports_yearly"),
    parent_report_id: str = Form(None),
    file: UploadFile = File(...),
    admin: Investor = Depends(require_permission("publish_report")),
    use_cases: ResearchPublishingUseCases = Depends(get_research_use_cases)
):
    try:
        report = use_cases.upload_draft(
            title=title,
            content="",
            summary=summary,
            plan_tier=plan_tier,
            parent_report_id=parent_report_id,
            file_obj=file.file,
            filename=file.filename
        )
        return ReportResponse(
            id=report.id,
            title=report.title,
            summary=report.summary,
            plan_tier_required=report.plan_tier_required,
            status=report.status,
            parent_report_id=report.parent_report_id,
            published_at=report.published_at.isoformat() if report.published_at else None,
            created_at=report.created_at.isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/admin/{report_id}/publish", response_model=ReportResponse)
def publish_report(
    report_id: str,
    admin: Investor = Depends(require_permission("publish_report")),
    use_cases: ResearchPublishingUseCases = Depends(get_research_use_cases)
):
    try:
        report = use_cases.publish_report(report_id)
        return ReportResponse(
            id=report.id,
            title=report.title,
            summary=report.summary,
            plan_tier_required=report.plan_tier_required,
            status=report.status,
            parent_report_id=report.parent_report_id,
            published_at=report.published_at.isoformat() if report.published_at else None,
            created_at=report.created_at.isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/admin", response_model=List[ReportResponse])
def admin_list_reports(
    skip: int = 0,
    limit: int = 100,
    admin: Investor = Depends(require_permission("publish_report")),
    use_cases: ResearchPublishingUseCases = Depends(get_research_use_cases)
):
    reports = use_cases.get_all_reports(skip=skip, limit=limit)
    return [
        ReportResponse(
            id=r.id,
            title=r.title,
            summary=r.summary,
            plan_tier_required=r.plan_tier_required,
            status=r.status,
            parent_report_id=r.parent_report_id,
            published_at=r.published_at.isoformat() if r.published_at else None,
            created_at=r.created_at.isoformat()
        ) for r in reports
    ]

@router.get("/", response_model=List[ReportResponse])
def list_published_reports(
    skip: int = 0,
    limit: int = 100,
    investor: Investor = Depends(get_current_investor),
    use_cases: ResearchPublishingUseCases = Depends(get_research_use_cases)
):
    reports = use_cases.get_published_reports(skip=skip, limit=limit)
    return [
        ReportResponse(
            id=r.id,
            title=r.title,
            summary=r.summary,
            plan_tier_required=r.plan_tier_required,
            status=r.status,
            parent_report_id=r.parent_report_id,
            published_at=r.published_at.isoformat() if r.published_at else None,
            created_at=r.created_at.isoformat()
        ) for r in reports
    ]

@router.get("/{report_id}/download")
def download_report(
    report_id: str,
    investor: Investor = Depends(get_current_investor),
    use_cases: ResearchPublishingUseCases = Depends(get_research_use_cases)
):
    try:
        buffer, filename = use_cases.download_report(report_id, investor)
        return StreamingResponse(
            buffer, 
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
