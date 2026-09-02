from fastapi import Depends
from contexts.billing.application.use_cases import BillingUseCases
from contexts.billing.infrastructure.mongo_repository import MongoSubscriptionRepository
from contexts.billing.infrastructure.razorpay_gateway import RazorpayGateway
from contexts.identity.infrastructure.mongo_repository import MongoInvestorRepository

def get_billing_use_cases() -> BillingUseCases:
    sub_repo = MongoSubscriptionRepository()
    gateway = RazorpayGateway()
    investor_repo = MongoInvestorRepository()
    return BillingUseCases(sub_repo, gateway, investor_repo)
