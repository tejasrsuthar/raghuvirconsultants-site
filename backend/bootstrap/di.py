from contexts.identity.infrastructure.mongo_repository import MongoInvestorRepository
from contexts.identity.infrastructure.totp import TOTPService
from contexts.identity.infrastructure.google_oauth import GoogleOAuthService
from contexts.identity.application.use_cases import IdentityUseCases

# Setup Repositories
investor_repository = MongoInvestorRepository()

# Setup Infrastructure Services
totp_service = TOTPService()
google_oauth_service = GoogleOAuthService()

# Setup Application Services
identity_use_cases = IdentityUseCases(
    repository=investor_repository,
    totp_service=totp_service,
    google_service=google_oauth_service
)

def get_identity_use_cases() -> IdentityUseCases:
    return identity_use_cases
