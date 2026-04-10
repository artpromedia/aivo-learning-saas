export type PlatformRole =
  | "super_admin"
  | "ops_manager"
  | "content_manager"
  | "support_agent"
  | "billing_manager";

export type Permission =
  | "platform.dashboard.view"
  | "platform.districts.view"
  | "platform.districts.manage"
  | "platform.users.view"
  | "platform.users.manage"
  | "platform.users.impersonate"
  | "platform.subscriptions.view"
  | "platform.subscriptions.manage"
  | "platform.content.view"
  | "platform.content.manage"
  | "platform.audit.view"
  | "platform.settings.view"
  | "platform.settings.manage"
  | "platform.roles.manage";

const ROLE_PERMISSIONS: Record<PlatformRole, Permission[]> = {
  super_admin: [
    "platform.dashboard.view",
    "platform.districts.view",
    "platform.districts.manage",
    "platform.users.view",
    "platform.users.manage",
    "platform.users.impersonate",
    "platform.subscriptions.view",
    "platform.subscriptions.manage",
    "platform.content.view",
    "platform.content.manage",
    "platform.audit.view",
    "platform.settings.view",
    "platform.settings.manage",
    "platform.roles.manage",
  ],
  ops_manager: [
    "platform.dashboard.view",
    "platform.districts.view",
    "platform.districts.manage",
    "platform.users.view",
    "platform.users.manage",
    "platform.subscriptions.view",
    "platform.subscriptions.manage",
    "platform.audit.view",
    "platform.settings.view",
  ],
  content_manager: [
    "platform.dashboard.view",
    "platform.content.view",
    "platform.content.manage",
    "platform.districts.view",
    "platform.users.view",
  ],
  support_agent: [
    "platform.dashboard.view",
    "platform.districts.view",
    "platform.users.view",
    "platform.subscriptions.view",
    "platform.audit.view",
  ],
  billing_manager: [
    "platform.dashboard.view",
    "platform.subscriptions.view",
    "platform.subscriptions.manage",
    "platform.districts.view",
    "platform.audit.view",
  ],
};

export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  super_admin: "Super Admin",
  ops_manager: "Operations Manager",
  content_manager: "Content Manager",
  support_agent: "Support Agent",
  billing_manager: "Billing Manager",
};

export const PLATFORM_ROLE_DESCRIPTIONS: Record<PlatformRole, string> = {
  super_admin: "Full access to all platform features and settings",
  ops_manager: "Manage districts, users, and subscriptions",
  content_manager: "Manage curriculum and learning content",
  support_agent: "View-only access for customer support",
  billing_manager: "Manage subscriptions and billing",
};

export function hasPermission(role: PlatformRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: PlatformRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function canAccessPage(role: PlatformRole, page: string): boolean {
  const pagePermissions: Record<string, Permission> = {
    dashboard: "platform.dashboard.view",
    districts: "platform.districts.view",
    users: "platform.users.view",
    subscriptions: "platform.subscriptions.view",
    content: "platform.content.view",
    audit: "platform.audit.view",
    settings: "platform.settings.view",
  };
  const required = pagePermissions[page];
  if (!required) return false;
  return hasPermission(role, required);
}
