import math
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.interfaces.schemas import (
    SmallcaseCreate, SmallcaseResponse,
    ServiceOfferingCreate, ServiceOfferingResponse,
    NotificationCreate, NotificationResponse,
    BlogPostCreate, BlogPostResponse,
    PlatformSettingsUpdate, PlatformSettingsResponse,
    NewsItemCreate, NewsItemResponse,
    PaginatedResponse, BulkStatusRequest, BulkDeleteRequest
)
from contexts.identity.interfaces.dependencies import require_permission
from app.infrastructure.repositories import (
    SmallcaseRepository, ServiceOfferingRepository, NotificationRepository,
    BlogPostRepository, PlatformSettingsRepository, NewsRepository
)
from app.domain.entities import SmallcaseItem, ServiceOffering, Notification, BlogPost, PlatformSettings, NewsItem
from contexts.identity.domain.entities import Investor

router = APIRouter(tags=["Enterprise CRUD Modules"])

smallcase_repo = SmallcaseRepository()
service_repo = ServiceOfferingRepository()
notification_repo = NotificationRepository()
blog_repo = BlogPostRepository()
settings_repo = PlatformSettingsRepository()
news_repo = NewsRepository()

# --- Smallcases Router ---
@router.get("/smallcases", response_model=PaginatedResponse)
def get_smallcases(page: int = Query(1, ge=1), limit: int = Query(10, ge=1)):
    items, total = smallcase_repo.get_all_paginated(page, limit)
    pages = math.ceil(total / limit) if total > 0 else 1
    return PaginatedResponse(
        items=[SmallcaseResponse.model_validate(i) for i in items],
        total=total, page=page, limit=limit, pages=pages
    )

@router.post("/smallcases", response_model=SmallcaseResponse)
def create_smallcase(req: SmallcaseCreate, admin: Investor = Depends(require_permission("reports:write"))):
    item = SmallcaseItem(name=req.name, cagr=req.cagr, min_investment=req.min_investment, description=req.description)
    created = smallcase_repo.create(item)
    return SmallcaseResponse.model_validate(created)

@router.put("/smallcases/{item_id}", response_model=SmallcaseResponse)
def update_smallcase(item_id: str, req: SmallcaseCreate, admin: Investor = Depends(require_permission("reports:write"))):
    updated = smallcase_repo.update(item_id, SmallcaseItem(**req.model_dump()))
    if not updated:
        raise HTTPException(status_code=404, detail="Smallcase item not found")
    return SmallcaseResponse.model_validate(updated)

@router.delete("/smallcases/{item_id}")
def delete_smallcase(item_id: str, admin: Investor = Depends(require_permission("reports:write"))):
    if not smallcase_repo.delete(item_id):
        raise HTTPException(status_code=404, detail="Smallcase item not found")
    return {"message": "Smallcase deleted successfully"}


# --- Services Router ---
@router.get("/services", response_model=PaginatedResponse)
def get_services(page: int = Query(1, ge=1), limit: int = Query(10, ge=1)):
    items, total = service_repo.get_all_paginated(page, limit)
    pages = math.ceil(total / limit) if total > 0 else 1
    return PaginatedResponse(
        items=[ServiceOfferingResponse.model_validate(i) for i in items],
        total=total, page=page, limit=limit, pages=pages
    )

@router.post("/services", response_model=ServiceOfferingResponse)
def create_service(req: ServiceOfferingCreate, admin: Investor = Depends(require_permission("reports:write"))):
    item = ServiceOffering(**req.model_dump())
    created = service_repo.create(item)
    return ServiceOfferingResponse.model_validate(created)

@router.put("/services/{item_id}", response_model=ServiceOfferingResponse)
def update_service(item_id: str, req: ServiceOfferingCreate, admin: Investor = Depends(require_permission("reports:write"))):
    updated = service_repo.update(item_id, ServiceOffering(**req.model_dump()))
    if not updated:
        raise HTTPException(status_code=404, detail="Service offering not found")
    return ServiceOfferingResponse.model_validate(updated)

@router.delete("/services/{item_id}")
def delete_service(item_id: str, admin: Investor = Depends(require_permission("reports:write"))):
    if not service_repo.delete(item_id):
        raise HTTPException(status_code=404, detail="Service offering not found")
    return {"message": "Service offering deleted successfully"}


# --- Notifications Router ---
@router.get("/notifications", response_model=PaginatedResponse)
def get_notifications(
    page: int = Query(1, ge=1), 
    limit: int = Query(10, ge=1),
    status: Optional[str] = None
):
    items, total = notification_repo.get_all_paginated(page, limit, status=status)
    pages = math.ceil(total / limit) if total > 0 else 1
    return PaginatedResponse(
        items=[NotificationResponse.model_validate(i) for i in items],
        total=total, page=page, limit=limit, pages=pages
    )

@router.post("/notifications", response_model=NotificationResponse)
def create_notification(req: NotificationCreate, admin: Investor = Depends(require_permission("reports:write"))):
    item = Notification(title=req.title, message=req.message, status=req.status, created_by=admin.username)
    created = notification_repo.create(item)
    return NotificationResponse.model_validate(created)

@router.put("/notifications/{item_id}", response_model=NotificationResponse)
def update_notification(item_id: str, req: NotificationCreate, admin: Investor = Depends(require_permission("reports:write"))):
    updated = notification_repo.update(item_id, Notification(title=req.title, message=req.message, status=req.status, created_by=admin.username))
    if not updated:
        raise HTTPException(status_code=404, detail="Notification not found")
    return NotificationResponse.model_validate(updated)

@router.delete("/notifications/{item_id}")
def delete_notification(item_id: str, admin: Investor = Depends(require_permission("reports:write"))):
    if not notification_repo.delete(item_id):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted successfully"}

@router.post("/notifications/bulk-status")
def bulk_status_notifications(req: BulkStatusRequest, admin: Investor = Depends(require_permission("reports:write"))):
    for item_id in req.ids:
        notification_repo.update_status(item_id, req.status)
    return {"message": f"Updated status for {len(req.ids)} notifications"}

@router.post("/notifications/bulk-delete")
def bulk_delete_notifications(req: BulkDeleteRequest, admin: Investor = Depends(require_permission("reports:write"))):
    deleted_count = 0
    for item_id in req.ids:
        if notification_repo.delete(item_id):
            deleted_count += 1
    return {"message": f"Deleted {deleted_count} notifications"}


# --- Blog Posts Router (with Tags) ---
@router.get("/blogs", response_model=PaginatedResponse)
def get_blogs(
    page: int = Query(1, ge=1), 
    limit: int = Query(10, ge=1),
    tag: Optional[str] = None
):
    items, total = blog_repo.get_all_paginated(page, limit, tag=tag)
    pages = math.ceil(total / limit) if total > 0 else 1
    return PaginatedResponse(
        items=[BlogPostResponse.model_validate(i) for i in items],
        total=total, page=page, limit=limit, pages=pages
    )

@router.get("/blogs/{item_id}", response_model=BlogPostResponse)
def get_blog_by_id(item_id: str):
    item = blog_repo.get_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return BlogPostResponse.model_validate(item)

@router.post("/blogs", response_model=BlogPostResponse)
def create_blog(req: BlogPostCreate, admin: Investor = Depends(require_permission("reports:write"))):
    item = BlogPost(**req.model_dump(), author=admin.username or "Admin")
    created = blog_repo.create(item)
    return BlogPostResponse.model_validate(created)

@router.put("/blogs/{item_id}", response_model=BlogPostResponse)
def update_blog(item_id: str, req: BlogPostCreate, admin: Investor = Depends(require_permission("reports:write"))):
    updated = blog_repo.update(item_id, BlogPost(**req.model_dump(), author=admin.username or "Admin"))
    if not updated:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return BlogPostResponse.model_validate(updated)

@router.delete("/blogs/{item_id}")
def delete_blog(item_id: str, admin: Investor = Depends(require_permission("reports:write"))):
    if not blog_repo.delete(item_id):
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"message": "Blog post deleted successfully"}


# --- Platform Settings Router ---
@router.get("/settings", response_model=PlatformSettingsResponse)
def get_settings():
    settings = settings_repo.get()
    return PlatformSettingsResponse.model_validate(settings)

@router.put("/settings", response_model=PlatformSettingsResponse)
def update_settings(req: PlatformSettingsUpdate, admin: Investor = Depends(require_permission("settings:write"))):
    settings = PlatformSettings(default_page_size=req.default_page_size, min_password_length=req.min_password_length)
    updated = settings_repo.update(settings)
    return PlatformSettingsResponse.model_validate(updated)


# --- News Stream Router ---
@router.get("/news", response_model=PaginatedResponse)
def get_news(page: int = Query(1, ge=1), limit: int = Query(10, ge=1)):
    items, total = news_repo.get_all_paginated(page, limit)
    pages = math.ceil(total / limit) if total > 0 else 1
    return PaginatedResponse(
        items=[NewsItemResponse.model_validate(i) for i in items],
        total=total, page=page, limit=limit, pages=pages
    )

@router.post("/news", response_model=NewsItemResponse)
def create_news(req: NewsItemCreate, admin: Investor = Depends(require_permission("reports:write"))):
    item = NewsItem(**req.model_dump())
    created = news_repo.create(item)
    return NewsItemResponse.model_validate(created)

@router.delete("/news/{item_id}")
def delete_news(item_id: str, admin: Investor = Depends(require_permission("reports:write"))):
    if not news_repo.delete(item_id):
        raise HTTPException(status_code=404, detail="News item not found")
    return {"message": "News item deleted successfully"}
