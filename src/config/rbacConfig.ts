// RBAC Configuration - Hardcoded Core Roles & Permissions for instant UI
import type { Database } from "@/integrations/supabase/types";
import type { Role, Permission } from "@/types/rbac";

export type AppRole = Database["public"]["Enums"]["app_role"];

// ============================================================================
// CORE ROLES - Hardcoded for instant UI loading
// ============================================================================

export const CORE_ROLES: Role[] = [
  {
    id: "core-admin",
    name: "admin",
    label: "Admin",
    description: "Full system access including all modules, settings, and permissions management",
    is_system: true,
    sort_order: 1,
  },
  {
    id: "core-labor_team",
    name: "labor_team",
    label: "Labor Management",
    description: "Full access to all modules, filters, and settings",
    is_system: true,
    sort_order: 2,
  },
  {
    id: "core-leadership",
    name: "leadership",
    label: "Leadership",
    description: "Access to all filters and sub-filters, excluded from Admin, Feedback, and Settings",
    is_system: true,
    sort_order: 3,
  },
  {
    id: "core-director",
    name: "director",
    label: "Director",
    description: "Facility and department level access only, no sub-filters, excluded from Admin, Feedback, and Settings",
    is_system: true,
    sort_order: 4,
  },
  {
    id: "core-manager",
    name: "manager",
    label: "Manager",
    description: "Department level access only, no sub-filters, excluded from Admin, Feedback, and Settings",
    is_system: true,
    sort_order: 5,
  },
];

// Legacy roles (not shown in admin UI but kept for backwards compatibility)
export const LEGACY_ROLES: Role[] = [
  {
    id: "core-moderator",
    name: "moderator",
    label: "Moderator",
    description: "Legacy role with administrative capabilities",
    is_system: true,
    sort_order: 100,
  },
  {
    id: "core-user",
    name: "user",
    label: "User",
    description: "Basic user role with limited access",
    is_system: true,
    sort_order: 101,
  },
  {
    id: "core-cno",
    name: "cno",
    label: "CNO",
    description: "Chief Nursing Officer with configurable filter access, excluded from Admin, Feedback, and Settings",
    is_system: true,
    sort_order: 102,
  },
  {
    id: "core-nurse_manager",
    name: "nurse_manager",
    label: "Nurse Manager (Legacy)",
    description: "Legacy role - now mapped to Manager",
    is_system: true,
    sort_order: 102,
  },
];

// All core roles including legacy
export const ALL_CORE_ROLES: Role[] = [...CORE_ROLES, ...LEGACY_ROLES];

// Helper maps for quick lookup
export const CORE_ROLES_BY_NAME: Record<string, Role> = ALL_CORE_ROLES.reduce(
  (acc, role) => ({ ...acc, [role.name]: role }),
  {} as Record<string, Role>
);

// ============================================================================
// CORE PERMISSIONS - Hardcoded for instant UI loading
// ============================================================================

export const CORE_PERMISSIONS: Permission[] = [
  // Module Access
  { id: "core-admin.access", key: "admin.access", label: "Admin Module", description: "Access to admin panel", category: "modules", is_system: true },
  { id: "core-feedback.access", key: "feedback.access", label: "Feedback Module", description: "Access to feedback page", category: "modules", is_system: true },
  { id: "core-staffing.access", key: "staffing.access", label: "Staffing", description: "Access to staffing summary", category: "modules", is_system: true },
  { id: "core-positions.access", key: "positions.access", label: "Positions", description: "Access to positions page", category: "modules", is_system: true },
  { id: "core-analytics.access", key: "analytics.access", label: "Analytics", description: "Access to analytics page", category: "modules", is_system: true },
  { id: "core-reports.access", key: "reports.access", label: "Reports", description: "Access to reports page", category: "modules", is_system: true },
  { id: "core-support.access", key: "support.access", label: "Support", description: "Access to support page", category: "modules", is_system: true },
  
  // Settings Access
  { id: "core-settings.volume_override", key: "settings.volume_override", label: "Volume Override Settings", description: "Access to volume override configuration", category: "settings", is_system: true },
  { id: "core-settings.np_override", key: "settings.np_override", label: "NP Override Settings", description: "Access to NP override configuration", category: "settings", is_system: true },
  
  // Filter Access
  { id: "core-filters.region", key: "filters.region", label: "Region Filter", description: "Access to region filter", category: "filters", is_system: true },
  { id: "core-filters.market", key: "filters.market", label: "Market Filter", description: "Access to market filter", category: "filters", is_system: true },
  { id: "core-filters.facility", key: "filters.facility", label: "Facility Filter", description: "Access to facility filter", category: "filters", is_system: true },
  { id: "core-filters.department", key: "filters.department", label: "Department Filter", description: "Access to department filter", category: "filters", is_system: true },
  
  // Sub-filter Access
  { id: "core-filters.submarket", key: "filters.submarket", label: "Submarket Filter", description: "Access to submarket filter", category: "subfilters", is_system: true },
  { id: "core-filters.level2", key: "filters.level2", label: "Level 2 Filter", description: "Access to level 2 filter", category: "subfilters", is_system: true },
  { id: "core-filters.pstat", key: "filters.pstat", label: "PSTAT Filter", description: "Access to PSTAT filter", category: "subfilters", is_system: true },
  
  // Approvals
  { id: "core-approvals.positions_to_open", key: "approvals.positions_to_open", label: "Approve Positions to Open", description: "Ability to approve or reject new position requests", category: "approvals", is_system: true },
  { id: "core-approvals.positions_to_close", key: "approvals.positions_to_close", label: "Approve Positions to Close", description: "Ability to approve or reject position closure requests", category: "approvals", is_system: true },
  { id: "core-approvals.volume_override", key: "approvals.volume_override", label: "Approve Volume Overrides", description: "Ability to create and modify volume overrides", category: "approvals", is_system: true },
  { id: "core-approvals.np_override", key: "approvals.np_override", label: "Approve NP Overrides", description: "Ability to create and modify NP overrides", category: "approvals", is_system: true },
  { id: "core-approvals.feedback", key: "approvals.feedback", label: "Manage Feedback Status", description: "Ability to approve, disregard, or backlog feedback items", category: "approvals", is_system: true },
  
  // Support
  { id: "core-support.add_faq", key: "support.add_faq", label: "Add FAQ", description: "Ability to create FAQ entries", category: "support", is_system: true },
];

// Helper maps for quick lookup
export const CORE_PERMISSIONS_BY_KEY: Record<string, Permission> = CORE_PERMISSIONS.reduce(
  (acc, perm) => ({ ...acc, [perm.key]: perm }),
  {} as Record<string, Permission>
);

export const CORE_PERMISSIONS_BY_CATEGORY: Record<string, Permission[]> = CORE_PERMISSIONS.reduce(
  (acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  },
  {} as Record<string, Permission[]>
);

// ============================================================================
// PERMISSION KEYS & CATEGORIES (for type safety)
// ============================================================================

export const PERMISSION_CATEGORIES = {
  modules: {
    label: "Module Access",
    permissions: {
      "admin.access": { label: "Admin Module", description: "Access to admin panel" },
      "feedback.access": { label: "Feedback Module", description: "Access to feedback page" },
      "staffing.access": { label: "Staffing", description: "Access to staffing summary" },
      "positions.access": { label: "Positions", description: "Access to positions page" },
      "analytics.access": { label: "Analytics", description: "Access to analytics page" },
      "reports.access": { label: "Reports", description: "Access to reports page" },
      "support.access": { label: "Support", description: "Access to support page" },
    },
  },
  settings: {
    label: "Settings Access",
    permissions: {
      "settings.volume_override": { label: "Volume Override Settings", description: "Access to volume override configuration" },
      "settings.np_override": { label: "NP Override Settings", description: "Access to NP override configuration" },
    },
  },
  filters: {
    label: "Filter Access",
    permissions: {
      "filters.region": { label: "Region Filter", description: "Access to region filter" },
      "filters.market": { label: "Market Filter", description: "Access to market filter" },
      "filters.facility": { label: "Facility Filter", description: "Access to facility filter" },
      "filters.department": { label: "Department Filter", description: "Access to department filter" },
    },
  },
  subfilters: {
    label: "Sub-filter Access",
    permissions: {
      "filters.submarket": { label: "Submarket Filter", description: "Access to submarket filter" },
      "filters.level2": { label: "Level 2 Filter", description: "Access to level 2 filter" },
      "filters.pstat": { label: "PSTAT Filter", description: "Access to PSTAT filter" },
    },
  },
  approvals: {
    label: "Approval Access",
    permissions: {
      "approvals.positions_to_open": { label: "Approve Positions to Open", description: "Ability to approve or reject new position requests" },
      "approvals.positions_to_close": { label: "Approve Positions to Close", description: "Ability to approve or reject position closure requests" },
      "approvals.volume_override": { label: "Approve Volume Overrides", description: "Ability to create and modify volume overrides" },
      "approvals.np_override": { label: "Approve NP Overrides", description: "Ability to create and modify NP overrides" },
      "approvals.feedback": { label: "Manage Feedback Status", description: "Ability to approve, disregard, or backlog feedback items" },
    },
  },
  support: {
    label: "Support",
    permissions: {
      "support.add_faq": { label: "Add FAQ", description: "Ability to create FAQ entries" },
    },
  },
} as const;

export type PermissionKey = 
  | keyof typeof PERMISSION_CATEGORIES.modules.permissions
  | keyof typeof PERMISSION_CATEGORIES.settings.permissions
  | keyof typeof PERMISSION_CATEGORIES.filters.permissions
  | keyof typeof PERMISSION_CATEGORIES.subfilters.permissions
  | keyof typeof PERMISSION_CATEGORIES.approvals.permissions
  | keyof typeof PERMISSION_CATEGORIES.support.permissions;

export const ALL_PERMISSION_KEYS: PermissionKey[] = CORE_PERMISSIONS.map(p => p.key as PermissionKey);

// ============================================================================
// DEFAULT ROLE PERMISSIONS - What each role gets by default
// ============================================================================

export const DEFAULT_ROLE_PERMISSIONS: Record<AppRole, PermissionKey[]> = {
  // Admin has all permissions
  admin: ALL_PERMISSION_KEYS,
  
  // Moderator has same as admin (legacy role)
  moderator: ALL_PERMISSION_KEYS,
  
  // User has basic access (legacy role)
  user: [
    "staffing.access",
    "positions.access",
    "analytics.access",
    "reports.access",
    "support.access",
    "filters.region",
    "filters.market",
    "filters.facility",
    "filters.department",
    "filters.submarket",
    "filters.level2",
    "filters.pstat",
  ],
  
  // Labor Management has full access including admin/feedback/settings
  labor_team: ALL_PERMISSION_KEYS,
  
  // Leadership: All filters, all sub-filters, excluded from admin/feedback/volume/np settings
  leadership: [
    "staffing.access",
    "positions.access",
    "analytics.access",
    "reports.access",
    "support.access",
    "filters.region",
    "filters.market",
    "filters.facility",
    "filters.department",
    "filters.submarket",
    "filters.level2",
    "filters.pstat",
  ],
  
  // CNO: Same as leadership (filter level can be configured per user via org access)
  cno: [
    "staffing.access",
    "positions.access",
    "analytics.access",
    "reports.access",
    "support.access",
    "filters.region",
    "filters.market",
    "filters.facility",
    "filters.department",
    "filters.submarket",
    "filters.level2",
    "filters.pstat",
  ],
  
  // Director: Only facility + department filters, no sub-filters, no admin/feedback/settings
  director: [
    "staffing.access",
    "positions.access",
    "analytics.access",
    "reports.access",
    "support.access",
    "filters.facility",
    "filters.department",
  ],
  
  // Manager: Only department filter, no sub-filters, no admin/feedback/settings
  manager: [
    "staffing.access",
    "positions.access",
    "analytics.access",
    "reports.access",
    "support.access",
    "filters.department",
  ],
  
  // Legacy nurse_manager (mapped to manager)
  nurse_manager: [
    "staffing.access",
    "positions.access",
    "analytics.access",
    "reports.access",
    "support.access",
    "filters.department",
  ],
};

// ============================================================================
// ROLE METADATA (for backward compatibility)
// ============================================================================

export const ROLE_METADATA: Record<AppRole, { label: string; description: string }> = {
  admin: { 
    label: "Admin", 
    description: "Full system access including all modules, settings, and permissions management" 
  },
  moderator: { 
    label: "Moderator", 
    description: "Legacy role with administrative capabilities" 
  },
  user: { 
    label: "User", 
    description: "Basic user role with limited access" 
  },
  labor_team: { 
    label: "Labor Management", 
    description: "Full access to all modules, filters, and settings" 
  },
  leadership: { 
    label: "Leadership", 
    description: "Access to all filters and sub-filters, excluded from Admin, Feedback, and Settings" 
  },
  cno: { 
    label: "CNO", 
    description: "Chief Nursing Officer with configurable filter access, excluded from Admin, Feedback, and Settings" 
  },
  director: { 
    label: "Director", 
    description: "Facility and department level access only, no sub-filters, excluded from Admin, Feedback, and Settings" 
  },
  manager: { 
    label: "Manager", 
    description: "Department level access only, no sub-filters, excluded from Admin, Feedback, and Settings" 
  },
  nurse_manager: { 
    label: "Nurse Manager (Legacy)", 
    description: "Legacy role - now mapped to Manager" 
  },
};

// Roles to display in the admin panel (exclude legacy roles)
export const MANAGEABLE_ROLES: AppRole[] = [
  "admin",
  "labor_team",
  "leadership",
  "cno",
  "director",
  "manager",
];
