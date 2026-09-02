from google.oauth2 import id_token
from google.auth.transport import requests
from bootstrap.settings import settings
from typing import Dict, Any

class GoogleOAuthService:
    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Verifies a Google OAuth token and returns the user information.
        Raises ValueError if the token is invalid.
        """
        if not settings.GOOGLE_CLIENT_ID:
            raise ValueError("GOOGLE_CLIENT_ID is not configured")

        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)
            return idinfo
        except ValueError as e:
            raise ValueError(f"Invalid Google token: {str(e)}")
