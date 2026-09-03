import pyotp
from typing import Tuple

class TOTPService:
    def generate_secret(self) -> str:
        """Generates a base32 secret for TOTP."""
        return pyotp.random_base32()

    def get_provisioning_uri(self, secret: str, email: str, issuer_name: str = "Raghuvir Consultants") -> str:
        """Generates a provisioning URI for QR code generation."""
        return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name=issuer_name)

    def verify_token(self, secret: str, token: str) -> bool:
        """Verifies a TOTP token against a secret."""
        totp = pyotp.TOTP(secret)
        return totp.verify(token)
