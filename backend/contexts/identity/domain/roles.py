from shared_kernel.value_objects import PermissionKey
from contexts.identity.domain.entities import Role

# Base Permissions
PERM_REPORTS_READ = PermissionKey(key="reports:read")
PERM_REPORTS_WRITE = PermissionKey(key="reports:write")
PERM_PORTFOLIO_READ = PermissionKey(key="portfolio:read")
PERM_PORTFOLIO_WRITE = PermissionKey(key="portfolio:write")
PERM_USERS_READ = PermissionKey(key="users:read")
PERM_USERS_WRITE = PermissionKey(key="users:write")
PERM_BILLING_READ = PermissionKey(key="billing:read")
PERM_BILLING_WRITE = PermissionKey(key="billing:write")
PERM_SETTINGS_WRITE = PermissionKey(key="settings:write")

# Default Roles
SUPER_ADMIN_ROLE = Role(
    name="SUPER_ADMIN",
    permissions=[
        PERM_REPORTS_READ, PERM_REPORTS_WRITE,
        PERM_PORTFOLIO_READ, PERM_PORTFOLIO_WRITE,
        PERM_USERS_READ, PERM_USERS_WRITE,
        PERM_BILLING_READ, PERM_BILLING_WRITE,
        PERM_SETTINGS_WRITE
    ]
)

ADMIN_ROLE = Role(
    name="ADMIN",
    permissions=[
        PERM_REPORTS_READ, PERM_REPORTS_WRITE,
        PERM_PORTFOLIO_READ, PERM_PORTFOLIO_WRITE,
        PERM_USERS_READ, PERM_USERS_WRITE,
        PERM_BILLING_READ, PERM_BILLING_WRITE,
        PERM_SETTINGS_WRITE
    ]
)

INVESTOR_ROLE = Role(
    name="INVESTOR",
    permissions=[
        PERM_REPORTS_READ,
        PERM_PORTFOLIO_READ,
        PERM_BILLING_READ
    ]
)

def get_role_by_name(name: str) -> Role:
    name_upper = name.upper()
    if name_upper == "SUPER_ADMIN":
        return SUPER_ADMIN_ROLE
    elif name_upper == "ADMIN":
        return ADMIN_ROLE
    else:
        return INVESTOR_ROLE
