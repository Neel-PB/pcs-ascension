// RBAC Configuration - Permission definitions and role defaults
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

// Permission categories and keys
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
} as const;

// All permission keys
export type PermissionKey = 
  | keyof typeof PERMISSION_CATEGORIES.modules.permissions
  | keyof typeof PERMISSION_CATEGORIES.settings.permissions
  | keyof typeof PERMISSION_CATEGORIES.filters.permissions
  | keyof typeof PERMISSION_CATEGORIES.subfilters.permissions;

// Get all permission keys as array
export const ALL_PERMISSION_KEYS: PermissionKey[] = [
  ...Object.keys(PERMISSION_CATEGORIES.modules.permissions),
  ...Object.keys(PERMISSION_CATEGORIES.settings.permissions),
  ...Object.keys(PERMISSION_CATEGORIES.filters.permissions),
  ...Object.keys(PERMISSION_CATEGORIES.subfilters.permissions),
] as PermissionKey[];

// Default role permissions
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

// Role display names and descriptions
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
