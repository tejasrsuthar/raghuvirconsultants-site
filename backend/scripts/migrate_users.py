import sys
import os
from datetime import datetime

# Add the backend directory to sys.path so we can import from app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.infrastructure.db import db
from app.infrastructure.repositories import UserRepository
from contexts.identity.infrastructure.mongo_repository import MongoInvestorRepository
from contexts.identity.domain.entities import Investor, UserStatus
from contexts.identity.domain.roles import Role, get_role_by_name
from shared_kernel.value_objects import InvestorId

def main():
    old_user_repo = UserRepository()
    new_investor_repo = MongoInvestorRepository()

    users, total = old_user_repo.get_all_paginated(1, 1000)
    print(f"Found {total} users in the old 'users' collection.")

    migrated = 0
    skipped = 0

    # Clear investors collection for clean migration
    new_investor_repo.collection.delete_many({})

    for user in users:
        # Map role
        role_name = user.role.value if hasattr(user.role, 'value') else str(user.role)
        try:
            new_role = get_role_by_name(role_name.upper())
        except ValueError:
            new_role = get_role_by_name("INVESTOR")

        # Map status
        status_value = user.status.value if hasattr(user.status, 'value') else str(user.status)
        try:
            new_status = UserStatus(status_value)
        except ValueError:
            new_status = UserStatus.ACTIVE

        # Create Investor entity
        investor = Investor(
            id=InvestorId(value=user.id),
            username=user.username or user.email.split("@")[0],
            email=user.email,
            full_name=user.full_name or user.username or "Unknown User",
            phone=user.phone,
            gender=user.gender,
            referral_source=user.referral_source,
            country=user.country,
            state=user.state,
            city=user.city,
            address=user.address,
            address_line1=user.address_line1,
            address_line2=user.address_line2,
            pincode=user.pincode,
            pan_number=user.pan_number,
            date_of_birth=user.date_of_birth,
            kyc_status=user.kyc_status,
            risk_profile=user.risk_profile,
            admin_notes=user.admin_notes,
            role=new_role,
            status=new_status,
            hashed_password=user.hashed_password,
            google_id=user.google_id,
            created_at=user.created_at,
            updated_at=datetime.utcnow()
        )

        new_investor_repo.save(investor)
        migrated += 1
        print(f"Migrated {user.email} -> {investor.id}")

    print(f"Migration complete: {migrated} migrated, {skipped} skipped.")

if __name__ == "__main__":
    main()
