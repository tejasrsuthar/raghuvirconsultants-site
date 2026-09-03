import pytest
from unittest.mock import Mock, patch
from contexts.billing.application.use_cases import BillingUseCases
from contexts.billing.domain.entities import Subscription, SubscriptionStatus
from contexts.identity.domain.entities import Investor
from shared_kernel.value_objects import InvestorId

@pytest.fixture
def mock_sub_repo():
    return Mock()

@pytest.fixture
def mock_gateway():
    return Mock()

@pytest.fixture
def mock_investor_repo():
    return Mock()

@pytest.fixture
def billing_use_cases(mock_sub_repo, mock_gateway, mock_investor_repo):
    return BillingUseCases(mock_sub_repo, mock_gateway, mock_investor_repo)

def test_subscribe_to_plan_success(billing_use_cases, mock_sub_repo, mock_gateway, mock_investor_repo):
    investor = Investor(
        id=InvestorId("inv_123"),
        email="test@example.com",
        username="tester",
        full_name="Tester"
    )
    mock_investor_repo.get_by_id.return_value = investor
    
    mock_gateway.create_customer.return_value = "cust_abc"
    mock_gateway.create_subscription.return_value = {
        "gateway_subscription_id": "sub_xyz",
        "short_url": "http://pay.url"
    }
    
    result = billing_use_cases.subscribe_to_plan("inv_123", "reports_plan")
    
    assert result["gateway_subscription_id"] == "sub_xyz"
    assert result["short_url"] == "http://pay.url"
    
    mock_sub_repo.save.assert_called_once()
    saved_sub = mock_sub_repo.save.call_args[0][0]
    assert saved_sub.investor_id == "inv_123"
    assert saved_sub.plan_id == "reports_plan"
    assert saved_sub.status == SubscriptionStatus.PENDING

def test_cancel_subscription_success(billing_use_cases, mock_sub_repo, mock_gateway):
    sub = Subscription(
        investor_id="inv_123",
        plan_id="reports_plan",
        gateway_subscription_id="sub_xyz",
        status=SubscriptionStatus.ACTIVE
    )
    mock_sub_repo.get_by_id.return_value = sub
    
    success = billing_use_cases.cancel_subscription("inv_123", sub.id)
    
    assert success is True
    mock_gateway.cancel_subscription.assert_called_once_with("sub_xyz")
    mock_sub_repo.save.assert_called_once()
    saved_sub = mock_sub_repo.save.call_args[0][0]
    assert saved_sub.cancel_at_period_end is True

def test_cancel_subscription_unauthorized(billing_use_cases, mock_sub_repo):
    sub = Subscription(
        investor_id="inv_456", # Different investor
        plan_id="reports_plan"
    )
    mock_sub_repo.get_by_id.return_value = sub
    
    with pytest.raises(ValueError, match="Subscription not found or unauthorized"):
        billing_use_cases.cancel_subscription("inv_123", sub.id)
