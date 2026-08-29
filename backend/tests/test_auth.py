import pytest
from app.interfaces.auth_router import validate_password_policy
from fastapi import HTTPException

def test_password_policy_valid():
    # Min 7 chars, includes at least 1 special char from !@#$%
    try:
        validate_password_policy("Secret1!")
        validate_password_policy("P@ssword1")
    except HTTPException:
        pytest.fail("Valid password raised HTTPException unexpectedly")

def test_password_policy_invalid_length():
    with pytest.raises(HTTPException) as exc:
        validate_password_policy("P@ss1")
    assert exc.value.status_code == 400
    assert "at least 7 characters" in exc.value.detail

def test_password_policy_invalid_special_char():
    with pytest.raises(HTTPException) as exc:
        validate_password_policy("Password123^")
    assert exc.value.status_code == 400
    assert "at least one special character" in exc.value.detail

def test_user_role_update():
    from app.infrastructure.repositories import UserRepository
    from app.domain.entities import User, UserRole, UserStatus
    repo = UserRepository()
    u = User(username="test_role_user", email="role_test@example.com", hashed_password="pwd", role=UserRole.INVESTOR, status=UserStatus.ACTIVE)
    created = repo.create(u)
    assert created.role == UserRole.INVESTOR
    
    updated = repo.update_role(created.id, UserRole.ADMIN)
    assert updated is True
    
    fetched = repo.get_by_id(created.id)
    assert fetched.role == UserRole.ADMIN
    repo.delete(created.id)

def test_admin_user_endpoints():
    from app.infrastructure.repositories import UserRepository
    from app.domain.entities import User, UserRole, UserStatus
    from app.interfaces.admin_router import list_investors, update_investor_username, reset_investor_password, delete_investor
    from app.interfaces.schemas import AdminUsernameUpdateRequest, AdminPasswordResetRequest

    repo = UserRepository()
    admin_user = User(username="superadmin", email="admin@rc.com", role=UserRole.ADMIN, status=UserStatus.ACTIVE)
    investor = User(username="test_inv", email="inv@test.com", hashed_password="pwd", role=UserRole.INVESTOR, status=UserStatus.ACTIVE)
    created_inv = repo.create(investor)

    # Test list
    res = list_investors(page=1, limit=10, admin=admin_user)
    assert res.total >= 1

    # Test update username
    u_res = update_investor_username(created_inv.id, AdminUsernameUpdateRequest(username="test_inv_updated"), admin=admin_user)
    assert "successfully" in u_res["message"]

    # Test password reset
    p_res = reset_investor_password(created_inv.id, AdminPasswordResetRequest(password="NewSecret123!"), admin=admin_user)
    assert "successfully" in p_res["message"]

    # Test delete
    d_res = delete_investor(created_inv.id, admin=admin_user)
    assert "deleted" in d_res["message"]
