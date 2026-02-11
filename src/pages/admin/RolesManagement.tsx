import { useState, useEffect } from "react";
import { RotateCcw, Plus, MoreVertical, Pencil, Trash2, Lock } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useDynamicRoles, type Role } from "@/hooks/useDynamicRoles";
import { RoleFormDialog } from "@/components/admin/RoleFormDialog";
import {
  PERMISSION_CATEGORIES,
  type AppRole,
  type PermissionKey,
} from "@/config/rbacConfig";
import { cn } from "@/lib/utils";

interface CompactRoleCardProps {
  role: Role;
  isSelected: boolean;
  permissionCount: number;
  overrideCount: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CompactRoleCard({ role, isSelected, permissionCount, overrideCount, onClick, onEdit, onDelete }: CompactRoleCardProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "w-full text-left px-3 py-2 rounded-md border transition-all flex items-center justify-between gap-2 group",
              "hover:bg-muted/50",
              isSelected 
                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                : "border-transparent hover:border-border"
            )}
          >
            <button
              onClick={onClick}
              className="flex items-center gap-2 min-w-0 flex-1"
            >
              {overrideCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
              )}
              <span className="font-medium text-sm truncate">{role.label}</span>
            </button>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs shrink-0 h-5 px-1.5">
                {permissionCount}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {!role.is_system && (
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="text-xs">{role.description || "No description"}</p>
          {role.is_system && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              System role
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CompactPermissionRowProps {
  permissionKey: PermissionKey;
  label: string;
  description: string;
  isEnabled: boolean;
  isOverridden: boolean;
  isUpdating: boolean;
  onToggle: (checked: boolean) => void;
  onReset: () => void;
}

function CompactPermissionRow({
  label,
  description,
  isEnabled,
  isOverridden,
  isUpdating,
  onToggle,
  onReset,
}: CompactPermissionRowProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-2 min-w-0">
              <Checkbox
                checked={isEnabled}
                onCheckedChange={onToggle}
                disabled={isUpdating}
                className="h-3.5 w-3.5"
              />
              <span className="text-sm truncate">{label}</span>
              {isOverridden && (
                <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
              )}
            </div>
            {isOverridden && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
                disabled={isUpdating}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="text-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CompactPermissionCardProps {
  title: string;
  permissions: Record<string, { label: string; description: string }>;
  role: AppRole;
  effectivePermissions: PermissionKey[];
  isPermissionOverridden: (role: AppRole, permission: PermissionKey) => boolean;
  onToggle: (permission: PermissionKey, value: boolean) => void;
  onReset: (permission: PermissionKey) => void;
  isUpdating: boolean;
}

function CompactPermissionCard({
  title,
  permissions,
  role,
  effectivePermissions,
  isPermissionOverridden,
  onToggle,
  onReset,
  isUpdating,
}: CompactPermissionCardProps) {
  const entries = Object.entries(permissions);
  const enabledCount = entries.filter(([key]) => 
    effectivePermissions.includes(key as PermissionKey)
  ).length;

  return (
    <div className="border rounded-md bg-card">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
        <Badge variant="secondary" className="text-xs h-4 px-1">
          {enabledCount}/{entries.length}
        </Badge>
      </div>
      <div className="p-1">
        {entries.map(([key, config]) => {
          const permissionKey = key as PermissionKey;
          const isEnabled = effectivePermissions.includes(permissionKey);
          const isOverridden = isPermissionOverridden(role, permissionKey);

          return (
            <CompactPermissionRow
              key={key}
              permissionKey={permissionKey}
              label={config.label}
              description={config.description}
              isEnabled={isEnabled}
              isOverridden={isOverridden}
              isUpdating={isUpdating}
              onToggle={(checked) => onToggle(permissionKey, checked)}
              onReset={() => onReset(permissionKey)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function RolesManagement() {
  const {
    manageableRoles: legacyManageableRoles,
    isLoading: permissionsLoading,
    getEffectivePermissions,
    isPermissionOverridden,
    setPermission,
    resetToDefaults,
  } = useRolePermissions();

  const {
    manageableRoles: dynamicRoles,
    isLoading: rolesLoading,
    createRole,
    updateRole,
    deleteRole,
  } = useDynamicRoles();

  const [selectedRoleName, setSelectedRoleName] = useState<AppRole | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const isLoading = permissionsLoading || rolesLoading;

  // Set initial selected role when roles load
  useEffect(() => {
    if (dynamicRoles.length > 0 && !selectedRoleName) {
      setSelectedRoleName(dynamicRoles[0].name as AppRole);
    }
  }, [dynamicRoles, selectedRoleName]);

  const selectedRole = dynamicRoles.find(r => r.name === selectedRoleName);
  const effectivePermissions = selectedRoleName ? getEffectivePermissions(selectedRoleName) : [];

  const getOverrideCount = (roleName: AppRole) => {
    return Object.values(PERMISSION_CATEGORIES)
      .flatMap(cat => Object.keys(cat.permissions))
      .filter(key => isPermissionOverridden(roleName, key as PermissionKey))
      .length;
  };

  const selectedOverrideCount = selectedRoleName ? getOverrideCount(selectedRoleName) : 0;

  const handleToggle = async (permission: PermissionKey, value: boolean) => {
    if (!selectedRoleName) return;
    setIsUpdating(true);
    try {
      await setPermission.mutateAsync({ role: selectedRoleName, permission, value });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async (permission: PermissionKey) => {
    if (!selectedRoleName) return;
    setIsUpdating(true);
    try {
      await setPermission.mutateAsync({ role: selectedRoleName, permission, value: null });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetAll = async () => {
    if (!selectedRoleName) return;
    setIsUpdating(true);
    try {
      await resetToDefaults.mutateAsync(selectedRoleName);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setSelectedRoleForEdit(role);
    setIsFormOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (roleToDelete) {
      await deleteRole.mutateAsync(roleToDelete.id);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      // Reset selection if deleted role was selected
      if (selectedRoleName === roleToDelete.name && dynamicRoles.length > 1) {
        const firstOtherRole = dynamicRoles.find(r => r.name !== roleToDelete.name);
        setSelectedRoleName(firstOtherRole?.name as AppRole || null);
      }
    }
  };

  const handleFormSubmit = async (data: { name: string; label: string; description?: string }) => {
    if (selectedRoleForEdit) {
      await updateRole.mutateAsync({ id: selectedRoleForEdit.id, data });
    } else {
      await createRole.mutateAsync(data);
    }
    setIsFormOpen(false);
    setSelectedRoleForEdit(null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <div className="w-48 space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Role Management</h3>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage roles. Toggle permissions for each role.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedRoleForEdit(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Left Panel - Role List */}
        <div className="w-48 shrink-0 space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 mb-2">
            Roles
          </h4>
          <div className="space-y-1">
            {dynamicRoles.map((role) => (
              <CompactRoleCard
                key={role.id}
                role={role}
                isSelected={role.name === selectedRoleName}
                permissionCount={getEffectivePermissions(role.name as AppRole).length}
                overrideCount={getOverrideCount(role.name as AppRole)}
                onClick={() => setSelectedRoleName(role.name as AppRole)}
                onEdit={() => handleEditRole(role)}
                onDelete={() => handleDeleteRole(role)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Permission Grid */}
        {selectedRole && selectedRoleName && (
          <div className="flex-1 border rounded-lg">
            <div className="flex items-center justify-between p-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{selectedRole.label}</h4>
                <Badge variant="secondary" className="text-xs">
                  {effectivePermissions.length} enabled
                </Badge>
                {selectedRole.is_system && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Lock className="h-3 w-3" />
                    System
                  </Badge>
                )}
              </div>
              {selectedOverrideCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleResetAll}
                  disabled={isUpdating}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset ({selectedOverrideCount})
                </Button>
              )}
            </div>
            
            {/* Permission Grid - 2 columns with 5 categories */}
            <div className="p-3 grid grid-cols-2 gap-3">
              {/* Left column: Modules + Sub-filters */}
              <div className="space-y-3">
                <CompactPermissionCard
                  title="Modules"
                  permissions={PERMISSION_CATEGORIES.modules.permissions}
                  role={selectedRoleName}
                  effectivePermissions={effectivePermissions}
                  isPermissionOverridden={isPermissionOverridden}
                  onToggle={handleToggle}
                  onReset={handleReset}
                  isUpdating={isUpdating}
                />

                <CompactPermissionCard
                  title="Sub-filters"
                  permissions={PERMISSION_CATEGORIES.subfilters.permissions}
                  role={selectedRoleName}
                  effectivePermissions={effectivePermissions}
                  isPermissionOverridden={isPermissionOverridden}
                  onToggle={handleToggle}
                  onReset={handleReset}
                  isUpdating={isUpdating}
                />
              </div>

              {/* Right column: Settings + Filters + Approvals */}
              <div className="space-y-3">
                <CompactPermissionCard
                  title="Settings"
                  permissions={PERMISSION_CATEGORIES.settings.permissions}
                  role={selectedRoleName}
                  effectivePermissions={effectivePermissions}
                  isPermissionOverridden={isPermissionOverridden}
                  onToggle={handleToggle}
                  onReset={handleReset}
                  isUpdating={isUpdating}
                />

                <CompactPermissionCard
                  title="Filters"
                  permissions={PERMISSION_CATEGORIES.filters.permissions}
                  role={selectedRoleName}
                  effectivePermissions={effectivePermissions}
                  isPermissionOverridden={isPermissionOverridden}
                  onToggle={handleToggle}
                  onReset={handleReset}
                  isUpdating={isUpdating}
                />

                <CompactPermissionCard
                  title="Approvals"
                  permissions={PERMISSION_CATEGORIES.approvals.permissions}
                  role={selectedRoleName}
                  effectivePermissions={effectivePermissions}
                  isPermissionOverridden={isPermissionOverridden}
                  onToggle={handleToggle}
                  onReset={handleReset}
                  isUpdating={isUpdating}
                />
              </div>
            </div>
          </div>
        )}

        {!selectedRole && (
          <div className="flex-1 border rounded-lg flex items-center justify-center py-12 text-muted-foreground">
            Select a role to manage its permissions
          </div>
        )}
      </div>

      {/* Role Form Dialog */}
      <RoleFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedRoleForEdit(null);
        }}
        role={selectedRoleForEdit}
        onSubmit={handleFormSubmit}
        isLoading={createRole.isPending || updateRole.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete?.label}"?
              This action cannot be undone. Users with this role will lose their access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
