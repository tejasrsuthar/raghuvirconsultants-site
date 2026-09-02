import pytest
from unittest.mock import patch, Mock
import razorpay
from contexts.billing.infrastructure.razorpay_gateway import RazorpayGateway
from bootstrap.settings import settings

@pytest.fixture
def mock_razorpay_client():
    with patch('razorpay.Client') as mock_client:
        instance = mock_client.return_value
        yield instance

@pytest.fixture
def gateway(mock_razorpay_client):
    return RazorpayGateway()

def test_create_customer(gateway, mock_razorpay_client):
    mock_razorpay_client.customer.create.return_value = {"id": "cust_123"}
    
    cust_id = gateway.create_customer("John Doe", "john@example.com", "9876543210")
    
    assert cust_id == "cust_123"
    mock_razorpay_client.customer.create.assert_called_once_with(data={
        "name": "John Doe",
        "email": "john@example.com",
        "contact": "9876543210"
    })

def test_create_subscription(gateway, mock_razorpay_client):
    mock_razorpay_client.subscription.create.return_value = {
        "id": "sub_456",
        "short_url": "https://rzp.io/i/sub_456"
    }
    
    result = gateway.create_subscription("plan_789", "cust_123")
    
    assert result["gateway_subscription_id"] == "sub_456"
    assert result["short_url"] == "https://rzp.io/i/sub_456"
    mock_razorpay_client.subscription.create.assert_called_once_with(data={
        "plan_id": "plan_789",
        "customer_id": "cust_123",
        "total_count": 12
    })

def test_cancel_subscription(gateway, mock_razorpay_client):
    gateway.cancel_subscription("sub_456", at_period_end=True)
    
    mock_razorpay_client.subscription.cancel.assert_called_once_with(
        "sub_456", {"cancel_at_cycle_end": 1}
    )

def test_verify_webhook_signature_success(gateway, mock_razorpay_client):
    # No exception means success
    result = gateway.verify_webhook_signature("payload", "signature")
    assert result is True
    mock_razorpay_client.utility.verify_webhook_signature.assert_called_once_with(
        "payload", "signature", settings.RAZORPAY_WEBHOOK_SECRET
    )

def test_verify_webhook_signature_failure(gateway, mock_razorpay_client):
    mock_razorpay_client.utility.verify_webhook_signature.side_effect = razorpay.errors.SignatureVerificationError("Invalid sig")
    
    result = gateway.verify_webhook_signature("payload", "invalid_sig")
    assert result is False
