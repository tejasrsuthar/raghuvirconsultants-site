from abc import ABC, abstractmethod
from typing import Optional, List, Tuple, BinaryIO
from .entities import Report

class ReportStorage(ABC):
    @abstractmethod
    def upload(self, file_obj: BinaryIO, object_name: str, content_type: str) -> str:
        """Uploads a file to storage and returns the storage_key."""
        pass

    @abstractmethod
    def download(self, storage_key: str) -> BinaryIO:
        """Downloads a file from storage as a file-like object."""
        pass
        
    @abstractmethod
    def get_download_url(self, storage_key: str, expires_in_seconds: int = 3600) -> str:
        """Gets a presigned download URL for direct client download."""
        pass

    @abstractmethod
    def delete(self, storage_key: str) -> bool:
        """Deletes a file from storage."""
        pass

    @abstractmethod
    def exists(self, storage_key: str) -> bool:
        """Checks if a file exists in storage."""
        pass

class ReportRepository(ABC):
    @abstractmethod
    def save(self, report: Report) -> None:
        pass

    @abstractmethod
    def get_by_id(self, report_id: str) -> Optional[Report]:
        pass

    @abstractmethod
    def find_published(self, skip: int = 0, limit: int = 100) -> List[Report]:
        pass
        
    @abstractmethod
    def find_all(self, skip: int = 0, limit: int = 100) -> List[Report]:
        pass

    @abstractmethod
    def get_addenda(self, parent_report_id: str) -> List[Report]:
        pass
