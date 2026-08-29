import pytest
from app.interfaces.auth_router import validate_password_policy, register, login
from app.interfaces.schemas import (
    UserRegisterRequest, AdminInvestorCreateRequest, UserLoginRequest, UserStatusUpdateRequest
)
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

def test_investor_registration_with_full_profile():
    from app.infrastructure.repositories import UserRepository
    repo = UserRepository()
    req = UserRegisterRequest(
        username="reg_investor_full",
        password="ValidPassword123!",
        full_name="Tejas Suthar",
        email="tejas_full@example.com",
        phone="+91 9924748572",
        pan_number="ABCDE1234F",
        date_of_birth="1995-05-15",
        address_line1="402 Royal Palms",
        address_line2="SG Highway",
        pincode="380054",
        city="Ahmedabad",
        state="Gujarat",
        country="India"
    )
    token_resp = register(req)
    assert token_resp.access_token is not None
    assert token_resp.email == "tejas_full@example.com"
    
    user = repo.get_by_username("reg_investor_full")
    assert user is not None
    assert user.full_name == "Tejas Suthar"
    assert user.pan_number == "ABCDE1234F"
    assert user.pincode == "380054"
    assert user.city == "Ahmedabad"
    repo.delete(user.id)

def test_admin_seed_and_login_with_credentials():
    from app.main import seed_admin
    seed_admin()
    
    # 1. Login with username 'admin'
    res_username = login(UserLoginRequest(email="admin", password="Raghuvir#Admin2026!"))
    assert res_username.role == "admin"
    assert res_username.access_token is not None

    # 2. Login with uppercase 'Admin'
    res_upper = login(UserLoginRequest(email="Admin", password="Raghuvir#Admin2026!"))
    assert res_upper.role == "admin"
    assert res_upper.access_token is not None

    # 3. Login with email 'admin@raghuvir.com'
    res_email = login(UserLoginRequest(email="admin@raghuvir.com", password="Raghuvir#Admin2026!"))
    assert res_email.role == "admin"
    assert res_email.access_token is not None

def test_update_investor_status_endpoints():
    from app.infrastructure.repositories import UserRepository
    from app.domain.entities import User, UserRole, UserStatus
    from app.interfaces.admin_router import update_investor_status

    repo = UserRepository()
    admin_user = User(username="superadmin", email="admin@rc.com", role=UserRole.ADMIN, status=UserStatus.ACTIVE)
    test_user = User(username="status_test_user", email="status_test@example.com", hashed_password="pwd", role=UserRole.INVESTOR, status=UserStatus.ACTIVE)
    created = repo.create(test_user)

    # 1. Test updating status to SUSPENDED
    res_suspend = update_investor_status(created.id, UserStatusUpdateRequest(status=UserStatus.SUSPENDED), admin=admin_user)
    assert "suspended" in res_suspend["message"]
    assert repo.get_by_id(created.id).status == UserStatus.SUSPENDED

    # 2. Test updating status back to ACTIVE
    res_active = update_investor_status(created.id, UserStatusUpdateRequest(status=UserStatus.ACTIVE), admin=admin_user)
    assert "active" in res_active["message"]
    assert repo.get_by_id(created.id).status == UserStatus.ACTIVE

    repo.delete(created.id)

def test_admin_create_investor_and_endpoints():
    from app.infrastructure.repositories import UserRepository
    from app.domain.entities import User, UserRole, UserStatus
    from app.interfaces.admin_router import (
        list_investors, create_investor_by_admin, update_investor_username, 
        reset_investor_password, delete_investor
    )
    from app.interfaces.schemas import AdminUsernameUpdateRequest, AdminPasswordResetRequest

    repo = UserRepository()
    admin_user = User(username="superadmin", email="admin@rc.com", role=UserRole.ADMIN, status=UserStatus.ACTIVE)

    # Test admin create investor
    create_req = AdminInvestorCreateRequest(
        username="admin_created_inv",
        password="AdminSetPassword123!",
        full_name="Harshit Suthar",
        email="harshit_admin_inv@example.com",
        pan_number="XYZAB5678K",
        phone="+91 9876543210",
        subscribed_reports=True,
        subscribed_portfolio=True
    )
    c_res = create_investor_by_admin(create_req, admin=admin_user)
    assert "successfully" in c_res["message"]
    inv_id = c_res["id"]

    # Test list
    res = list_investors(page=1, limit=10, admin=admin_user)
    assert res.total >= 1

    # Test update username
    u_res = update_investor_username(inv_id, AdminUsernameUpdateRequest(username="admin_created_updated"), admin=admin_user)
    assert "successfully" in u_res["message"]

    # Test password reset
    p_res = reset_investor_password(inv_id, AdminPasswordResetRequest(password="NewSecret123!"), admin=admin_user)
    assert "successfully" in p_res["message"]

    # Test update subscription
    from app.interfaces.admin_router import update_investor_subscription_by_admin, update_investor_profile_by_admin
    from app.interfaces.schemas import AdminInvestorSubscriptionUpdate, AdminInvestorProfileUpdate
    from app.domain.entities import ServiceType
    sub_res = update_investor_subscription_by_admin(
        inv_id,
        AdminInvestorSubscriptionUpdate(service_type=ServiceType.REPORTS, active=False),
        admin=admin_user
    )
    assert "successfully" in sub_res["message"]

    # Test update profile
    prof_res = update_investor_profile_by_admin(
        inv_id,
        AdminInvestorProfileUpdate(email="harshit_admin_inv@example.com", admin_notes="VIP Client Note"),
        admin=admin_user
    )
    assert "successfully" in prof_res["message"]

    # Test delete
    d_res = delete_investor(inv_id, admin=admin_user)
    assert "deleted" in d_res["message"]
