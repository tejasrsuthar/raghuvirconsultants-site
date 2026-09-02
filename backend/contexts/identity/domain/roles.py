from shared_kernel.value_objects import PermissionKey
from contexts.identity.domain.entities import Role

# Base Permissions
PERM_REPORTS_READ = PermissionKey("reports:read", "Read research reports")
PERM_REPORTS_WRITE = PermissionKey("reports:write", "Create/Edit research reports")
PERM_PORTFOLIO_READ = PermissionKey("portfolio:read", "Read model portfolios")
PERM_PORTFOLIO_WRITE = PermissionKey("portfolio:write", "Edit model portfolios")
PERM_USERS_READ = PermissionKey("users:read", "Read user list")
PERM_USERS_WRITE = PermissionKey("users:write", "Manage users and roles")
PERM_BILLING_READ = PermissionKey("billing:read", "View billing/payments")
PERM_BILLING_WRITE = PermissionKey("billing:write", "Manage billing/payments")
PERM_SETTINGS_WRITE = PermissionKey("settings:write", "Manage system settings")

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
        PERM_USERS_READ,
        PERM_BILLING_READ
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
