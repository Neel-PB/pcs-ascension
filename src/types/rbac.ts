// Shared RBAC type definitions for consistency between hardcoded and DB data

export interface Role {
  id: string;
  name: string;
  label: string;
  description: string | null;
  is_system: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  key: string;
  label: string;
  description: string | null;
  category: string;
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoleFormData {
  name: string;
  label: string;
  description?: string;
  sort_order?: number;
}

export interface PermissionFormData {
  key: string;
  label: string;
  description?: string;
  category: string;
}
