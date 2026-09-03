import io
from typing import BinaryIO
from minio import Minio
from minio.error import S3Error
from datetime import timedelta
from contexts.research_publishing.domain.ports import ReportStorage
import pypdf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import Color

class MinIOStorage(ReportStorage):
    def __init__(self, endpoint: str, access_key: str, secret_key: str, bucket_name: str, secure: bool = True):
        self.client = Minio(
            endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure
        )
        self.bucket_name = bucket_name

    def _ensure_bucket_exists(self):
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
        except S3Error as e:
            raise Exception(f"Failed to ensure bucket exists: {e}")

    def upload(self, file_obj: BinaryIO, object_name: str, content_type: str) -> str:
        # Seek to end to get file size, then rewind
        file_obj.seek(0, 2)
        size = file_obj.tell()
        file_obj.seek(0)
        
        self._ensure_bucket_exists()
        
        try:
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                data=file_obj,
                length=size,
                content_type=content_type
            )
            return object_name
        except S3Error as e:
            raise Exception(f"Upload failed: {e}")

    def download(self, storage_key: str) -> BinaryIO:
        try:
            response = self.client.get_object(self.bucket_name, storage_key)
            data = response.read()
            response.close()
            response.release_conn()
            return io.BytesIO(data)
        except S3Error as e:
            raise Exception(f"Download failed: {e}")
            
    def get_download_url(self, storage_key: str, expires_in_seconds: int = 3600) -> str:
        try:
            return self.client.presigned_get_object(
                self.bucket_name,
                storage_key,
                expires=timedelta(seconds=expires_in_seconds)
            )
        except S3Error as e:
            raise Exception(f"Failed to generate presigned URL: {e}")

    def delete(self, storage_key: str) -> bool:
        try:
            self.client.remove_object(self.bucket_name, storage_key)
            return True
        except S3Error as e:
            raise Exception(f"Delete failed: {e}")

    def exists(self, storage_key: str) -> bool:
        try:
            self.client.stat_object(self.bucket_name, storage_key)
            return True
        except S3Error:
            return False

class PDFWatermarker:
    @staticmethod
    def apply_watermark(input_pdf: BinaryIO, watermark_text: str) -> BinaryIO:
        """
        Applies a diagonal watermark text across every page of the given PDF.
        Returns a new BytesIO object with the watermarked PDF.
        """
        input_pdf.seek(0)
        pdf_reader = pypdf.PdfReader(input_pdf)
        pdf_writer = pypdf.PdfWriter()

        if len(pdf_reader.pages) == 0:
            input_pdf.seek(0)
            return input_pdf

        # Generate watermark overlay PDF in memory
        watermark_buffer = io.BytesIO()
        
        # Get dimensions of first page
        first_page = pdf_reader.pages[0]
        # Box coords are [ll_x, ll_y, ur_x, ur_y]
        width = float(first_page.mediabox.width)
        height = float(first_page.mediabox.height)

        c = canvas.Canvas(watermark_buffer, pagesize=(width, height))
        
        # Set styling (Light grey, slightly transparent, rotated)
        c.setFillColor(Color(0.5, 0.5, 0.5, alpha=0.3))
        c.setFont("Helvetica-Bold", 40)
        
        c.saveState()
        # Move origin to center, rotate, and draw text
        c.translate(width / 2.0, height / 2.0)
        c.rotate(45)
        c.drawCentredString(0, 0, watermark_text)
        
        # Draw it a few more times for good coverage
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(0, -300, watermark_text)
        c.drawCentredString(0, 300, watermark_text)
        
        c.restoreState()
        c.save()

        watermark_buffer.seek(0)
        watermark_pdf = pypdf.PdfReader(watermark_buffer)
        watermark_page = watermark_pdf.pages[0]

        # Apply watermark to each page
        for page in pdf_reader.pages:
            page.merge_page(watermark_page)
            pdf_writer.add_page(page)

        output_buffer = io.BytesIO()
        pdf_writer.write(output_buffer)
        output_buffer.seek(0)
        
        return output_buffer
