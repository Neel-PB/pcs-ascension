import { useState, useEffect, useMemo, useCallback } from "react";
import { RotateCcw, MoreVertical, Pencil, Trash2, Lock, Save, X } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { PERMISSION_CATEGORIES, type AppRole, type PermissionKey } from "@/config/rbacConfig";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Type for pending permission changes (role -> permission -> new value)
type PendingChanges = Map<AppRole, Map<PermissionKey, boolean>>;

interface RoleDetailViewProps {
  roles: Role[];
  onEditRole: (role: Role) => void;
}

interface CompactRoleCardProps {
  role: Role;
  isSelected: boolean;
  overrideCount: number;
  hasPendingChanges: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CompactRoleCard({ role, isSelected, overrideCount, hasPendingChanges, onClick, onEdit, onDelete }: CompactRoleCardProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "w-full text-left px-3 py-2 rounded-md transition-all flex items-center justify-between gap-2 group",
              isSelected 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted/50"
            )}
          >
            <button
              onClick={onClick}
              className="flex items-center gap-2 min-w-0 flex-1"
            >
              {hasPendingChanges ? (
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  isSelected ? "bg-primary-foreground" : "bg-primary"
                )} />
              ) : overrideCount > 0 ? (
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  isSelected ? "bg-primary-foreground/70" : "bg-warning"
                )} />
              ) : null}
              <span className={cn(
                "font-medium text-sm truncate",
                isSelected && "text-primary-foreground"
              )}>{role.label}</span>
            </button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                      isSelected && "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20"
                    )}
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
  label: string;
  description: string;
  isEnabled: boolean;
  isOverridden: boolean;
  isPending: boolean;
  isUpdating: boolean;
  onToggle: (checked: boolean) => void;
  onReset: () => void;
}

function CompactPermissionRow({
  label,
  description,
  isEnabled,
  isOverridden,
  isPending,
  isUpdating,
  onToggle,
  onReset,
}: CompactPermissionRowProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors group",
            isPending && "bg-primary/5"
          )}>
            <div className="flex items-center gap-2 min-w-0">
              <Checkbox
                checked={isEnabled}
                onCheckedChange={onToggle}
                disabled={isUpdating}
                className="h-3.5 w-3.5"
              />
              <span className="text-sm truncate">{label}</span>
              {isPending ? (
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              ) : isOverridden ? (
                <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
              ) : null}
            </div>
            {isOverridden && !isPending && (
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
  displayPermissions: PermissionKey[];
  isPermissionOverridden: (role: AppRole, permission: PermissionKey) => boolean;
  isPending: (permission: PermissionKey) => boolean;
  onToggle: (permission: PermissionKey, value: boolean) => void;
  onReset: (permission: PermissionKey) => void;
  isUpdating: boolean;
}

function CompactPermissionCard({
  title,
  permissions,
  role,
  displayPermissions,
  isPermissionOverridden,
  isPending,
  onToggle,
  onReset,
  isUpdating,
}: CompactPermissionCardProps) {
  const entries = Object.entries(permissions);

  return (
    <div className="border rounded-md bg-card">
      <div className="px-3 py-2 border-b bg-muted/30">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      </div>
      <div className="p-1">
        {entries.map(([key, config]) => {
          const permissionKey = key as PermissionKey;
          const isEnabled = displayPermissions.includes(permissionKey);
          const isOverridden = isPermissionOverridden(role, permissionKey);
          const hasPending = isPending(permissionKey);

          return (
            <CompactPermissionRow
              key={key}
              label={config.label}
              description={config.description}
              isEnabled={isEnabled}
              isOverridden={isOverridden}
              isPending={hasPending}
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

export function RoleDetailView({ roles, onEditRole }: RoleDetailViewProps) {
  const {
    getEffectivePermissions,
    isPermissionOverridden,
    setPermission,
    resetToDefaults,
  } = useRolePermissions();

  const { deleteRole } = useDynamicRoles();

  const [selectedRoleName, setSelectedRoleName] = useState<AppRole | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [unsavedWarningOpen, setUnsavedWarningOpen] = useState(false);
  const [pendingSwitchRole, setPendingSwitchRole] = useState<AppRole | null>(null);
  
  // Track pending changes locally - not saved until user clicks Save
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>(new Map());

  // Set initial selected role when roles load
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleName) {
      setSelectedRoleName(roles[0].name as AppRole);
    }
  }, [roles, selectedRoleName]);

  const selectedRole = roles.find(r => r.name === selectedRoleName);
  const effectivePermissions = selectedRoleName ? getEffectivePermissions(selectedRoleName) : [];

  // Get pending changes count for a specific role
  const getRolePendingCount = useCallback((roleName: AppRole) => {
    return pendingChanges.get(roleName)?.size || 0;
  }, [pendingChanges]);

  // Total pending changes across all roles
  const totalPendingCount = useMemo(() => {
    let count = 0;
    pendingChanges.forEach(roleChanges => {
      count += roleChanges.size;
    });
    return count;
  }, [pendingChanges]);

  // Get display permissions (effective + pending changes applied)
  const getDisplayPermissions = useCallback((roleName: AppRole): PermissionKey[] => {
    const effective = getEffectivePermissions(roleName);
    const pending = pendingChanges.get(roleName);
    if (!pending || pending.size === 0) return effective;

    const result = new Set(effective);
    pending.forEach((value, key) => {
      if (value === true) {
        result.add(key);
      } else {
        result.delete(key);
      }
    });
    return Array.from(result);
  }, [getEffectivePermissions, pendingChanges]);

  const displayPermissions = selectedRoleName ? getDisplayPermissions(selectedRoleName) : [];

  const getOverrideCount = (roleName: AppRole) => {
    return Object.values(PERMISSION_CATEGORIES)
      .flatMap(cat => Object.keys(cat.permissions))
      .filter(key => isPermissionOverridden(roleName, key as PermissionKey))
      .length;
  };

  const selectedOverrideCount = selectedRoleName ? getOverrideCount(selectedRoleName) : 0;

  // Check if a permission has pending changes
  const isPendingPermission = useCallback((permission: PermissionKey): boolean => {
    if (!selectedRoleName) return false;
    return pendingChanges.get(selectedRoleName)?.has(permission) || false;
  }, [selectedRoleName, pendingChanges]);

  // Handle toggle - updates local state only
  const handleToggle = useCallback((permission: PermissionKey, value: boolean) => {
    if (!selectedRoleName) return;
    
    setPendingChanges(prev => {
      const next = new Map(prev);
      const roleChanges = new Map(next.get(selectedRoleName) || new Map());
      
      // Check if this change would revert to the current effective state
      const currentEffective = getEffectivePermissions(selectedRoleName);
      const isCurrentlyEnabled = currentEffective.includes(permission);
      
      if (value === isCurrentlyEnabled) {
        // Reverts to current state, remove from pending
        roleChanges.delete(permission);
      } else {
        roleChanges.set(permission, value);
      }
      
      if (roleChanges.size === 0) {
        next.delete(selectedRoleName);
      } else {
        next.set(selectedRoleName, roleChanges);
      }
      return next;
    });
  }, [selectedRoleName, getEffectivePermissions]);

  const handleReset = async (permission: PermissionKey) => {
    if (!selectedRoleName) return;
    setIsSaving(true);
    try {
      await setPermission.mutateAsync({ role: selectedRoleName, permission, value: null });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAll = async () => {
    if (!selectedRoleName) return;
    setIsSaving(true);
    try {
      await resetToDefaults.mutateAsync(selectedRoleName);
    } finally {
      setIsSaving(false);
    }
  };

  // Save all pending changes
  const handleSave = async () => {
    if (pendingChanges.size === 0) return;
    
    setIsSaving(true);
    try {
      for (const [role, changes] of pendingChanges) {
        for (const [permission, value] of changes) {
          await setPermission.mutateAsync({ role, permission, value });
        }
      }
      setPendingChanges(new Map());
      toast.success("Changes saved successfully");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard all pending changes
  const handleDiscard = useCallback(() => {
    setPendingChanges(new Map());
  }, []);

  // Handle role selection with unsaved warning
  const handleRoleSelect = useCallback((roleName: AppRole) => {
    if (roleName === selectedRoleName) return;
    
    // Check if current role has pending changes
    const currentRolePending = selectedRoleName ? getRolePendingCount(selectedRoleName) : 0;
    
    if (currentRolePending > 0) {
      setPendingSwitchRole(roleName);
      setUnsavedWarningOpen(true);
    } else {
      setSelectedRoleName(roleName);
    }
  }, [selectedRoleName, getRolePendingCount]);

  // Handle unsaved warning dialog actions
  const handleDiscardAndSwitch = useCallback(() => {
    if (selectedRoleName) {
      setPendingChanges(prev => {
        const next = new Map(prev);
        next.delete(selectedRoleName);
        return next;
      });
    }
    if (pendingSwitchRole) {
      setSelectedRoleName(pendingSwitchRole);
    }
    setPendingSwitchRole(null);
    setUnsavedWarningOpen(false);
  }, [selectedRoleName, pendingSwitchRole]);

  const handleSaveAndSwitch = async () => {
    if (selectedRoleName) {
      const roleChanges = pendingChanges.get(selectedRoleName);
      if (roleChanges) {
        setIsSaving(true);
        try {
          for (const [permission, value] of roleChanges) {
            await setPermission.mutateAsync({ role: selectedRoleName, permission, value });
          }
          setPendingChanges(prev => {
            const next = new Map(prev);
            next.delete(selectedRoleName);
            return next;
          });
          if (pendingSwitchRole) {
            setSelectedRoleName(pendingSwitchRole);
          }
          toast.success("Changes saved");
        } catch (error) {
          toast.error("Failed to save changes");
        } finally {
          setIsSaving(false);
        }
      }
    }
    setPendingSwitchRole(null);
    setUnsavedWarningOpen(false);
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
      if (selectedRoleName === roleToDelete.name && roles.length > 1) {
        const firstOtherRole = roles.find(r => r.name !== roleToDelete.name);
        setSelectedRoleName(firstOtherRole?.name as AppRole || null);
      }
    }
  };

  return (
    <div className="flex flex-col border rounded-lg bg-card overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Role List */}
        <div className="w-52 shrink-0 border-r bg-muted/20">
          <div className="flex items-center h-[49px] px-3 border-b bg-muted/30">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Roles
            </h4>
          </div>
          <div className="p-2 space-y-1">
            {roles.map((role) => (
              <CompactRoleCard
                key={role.id}
                role={role}
                isSelected={role.name === selectedRoleName}
                overrideCount={getOverrideCount(role.name as AppRole)}
                hasPendingChanges={getRolePendingCount(role.name as AppRole) > 0}
                onClick={() => handleRoleSelect(role.name as AppRole)}
                onEdit={() => onEditRole(role)}
                onDelete={() => handleDeleteRole(role)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Permission Grid */}
        {selectedRole && selectedRoleName && (
          <div className="flex-1">
            <div className="flex items-center justify-between h-[49px] px-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{selectedRole.label}</h4>
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
                  disabled={isSaving}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset ({selectedOverrideCount})
                </Button>
              )}
          </div>
          
            {/* Permission Grid - auto-balanced masonry layout */}
            <div className="p-3 columns-2 gap-3">
              <div className="break-inside-avoid mb-3">
                <CompactPermissionCard
                  title="Modules"
                  permissions={PERMISSION_CATEGORIES.modules.permissions}
                  role={selectedRoleName}
                  displayPermissions={displayPermissions}
                  isPermissionOverridden={isPermissionOverridden}
                  isPending={isPendingPermission}
                  onToggle={handleToggle}
                  onReset={handleReset}
                  isUpdating={isSaving}
                />
              </div>

              <div className="break-inside-avoid mb-3">
                <CompactPermissionCard
                  title="Sub-filters"
                  permissions={PERMISSION_CATEGORIES.subfilters.permissions}
                  role={selectedRoleName}
                  displayPermissions={displayPermissions}
                  isPermissionOverridden={isPermissionOverridden}
                  isPending={isPendingPermission}
                  onToggle={handleToggle}
                  onReset={handleReset}
                  isUpdating={isSaving}
                />
              </div>

              <div className="break-inside-avoid mb-3">
                <CompactPermissionCard
                  title="Settings"
                  permissions={PERMISSION_CATEGORIES.settings.permissions}
                  role={selectedRoleName}
                  displayPermissions={displayPermissions}
                  isPermissionOverridden={isPermissionOverridden}
                  isPending={isPendingPermission}
                  onToggle={handleToggle}
                  onReset={handleReset}
                  isUpdating={isSaving}
                />
              </div>

              <div className="break-inside-avoid mb-3">
                <CompactPermissionCard
                  title="Filters"
                  permissions={PERMISSION_CATEGORIES.filters.permissions}
                  role={selectedRoleName}
                  displayPermissions={displayPermissions}
                  isPermissionOverridden={isPermissionOverridden}
                  isPending={isPendingPermission}
                  onToggle={handleToggle}
                  onReset={handleReset}
                  isUpdating={isSaving}
                />
              </div>

              <div className="break-inside-avoid mb-3">
                <CompactPermissionCard
                  title="Approvals"
                  permissions={PERMISSION_CATEGORIES.approvals.permissions}
                  role={selectedRoleName}
                  displayPermissions={displayPermissions}
                  isPermissionOverridden={isPermissionOverridden}
                  isPending={isPendingPermission}
                  onToggle={handleToggle}
                  onReset={handleReset}
                  isUpdating={isSaving}
                />
              </div>

              <div className="break-inside-avoid mb-3">
                <CompactPermissionCard
                  title="Support"
                  permissions={PERMISSION_CATEGORIES.support.permissions}
                  role={selectedRoleName}
                  displayPermissions={displayPermissions}
                  isPermissionOverridden={isPermissionOverridden}
                  isPending={isPendingPermission}
                  onToggle={handleToggle}
                  onReset={handleReset}
                  isUpdating={isSaving}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer for Save/Discard when there are pending changes */}
      {totalPendingCount > 0 && (
        <div className="flex items-center justify-between p-3 border-t bg-muted/30">
          <span className="text-sm text-muted-foreground">
            {totalPendingCount} unsaved change{totalPendingCount !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDiscard} disabled={isSaving}>
              <X className="h-4 w-4 mr-1" />
              Discard
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete?.label}"?
              This action cannot be undone.
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

      {/* Unsaved Changes Warning Dialog */}
      <AlertDialog open={unsavedWarningOpen} onOpenChange={setUnsavedWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes for {selectedRole?.label}. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingSwitchRole(null)}>Cancel</AlertDialogCancel>
            <Button variant="outline" onClick={handleDiscardAndSwitch}>
              Discard
            </Button>
            <Button onClick={handleSaveAndSwitch} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save & Switch"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
