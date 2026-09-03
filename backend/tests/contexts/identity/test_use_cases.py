import pytest
from unittest.mock import Mock
from contexts.identity.application.use_cases import IdentityUseCases, RegisterInvestorRequest
from contexts.identity.domain.entities import Investor, UserStatus
from contexts.identity.domain.roles import get_role_by_name

@pytest.fixture
def mock_repo():
    return Mock()

@pytest.fixture
def mock_totp():
    return Mock()

@pytest.fixture
def mock_google():
    return Mock()

@pytest.fixture
def use_cases(mock_repo, mock_totp, mock_google):
    return IdentityUseCases(mock_repo, mock_totp, mock_google)

def test_register_investor_success(use_cases, mock_repo):
    mock_repo.get_by_email.return_value = None
    mock_repo.get_by_username.return_value = None
    
    req = RegisterInvestorRequest(
        email="test@example.com",
        full_name="Test User",
        username="testuser",
        password="password123"
    )
    
    investor = use_cases.register_investor(req)
    
    assert investor.email == "test@example.com"
    assert investor.role.name == "INVESTOR"
    mock_repo.save.assert_called_once()

def test_authenticate_success(use_cases, mock_repo):
    mock_investor = Mock(spec=Investor)
    mock_investor.status = UserStatus.ACTIVE
    mock_investor.hashed_password = "$2b$12$somehashedpasswordstringhere"
    mock_investor.two_factor_enabled = False
    
    mock_repo.get_by_email.return_value = mock_investor
    
    # We mock verify_password as True for testing purposes
    import app.core.security
    original_verify = app.core.security.verify_password
    app.core.security.verify_password = Mock(return_value=True)
    
    result = use_cases.authenticate("test@example.com", "password123")
    assert result == mock_investor
    
    app.core.security.verify_password = original_verify
