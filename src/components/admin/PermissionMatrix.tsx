import { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronRight, Lock, MoreVertical, Pencil, Trash2, RotateCcw, Save, X } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenuSeparator,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePermissions, type Permission } from "@/hooks/usePermissions";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useDynamicRoles, type Role } from "@/hooks/useDynamicRoles";
import { type AppRole, type PermissionKey } from "@/config/rbacConfig";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// Type for pending permission changes (role -> permission -> new value)
type PendingChanges = Map<AppRole, Map<PermissionKey, boolean>>;

interface PermissionMatrixProps {
  roles: Role[];
  onEditRole?: (role: Role) => void;
}

const CATEGORY_ORDER = ["modules", "settings", "filters", "subfilters", "approvals", "support"];
const CATEGORY_LABELS: Record<string, string> = {
  modules: "Modules",
  settings: "Settings",
  filters: "Filters",
  subfilters: "Sub-filters",
  approvals: "Approvals",
  support: "Support",
};

export function PermissionMatrix({ roles, onEditRole }: PermissionMatrixProps) {
  const { permissions, permissionsByCategory } = usePermissions();
  const { getEffectivePermissions, isPermissionOverridden, setPermission, resetToDefaults } = useRolePermissions();
  const { deleteRole } = useDynamicRoles();

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Track pending changes locally - not saved until user clicks Save
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>(new Map());

  // Total pending changes across all roles
  const totalPendingCount = useMemo(() => {
    let count = 0;
    pendingChanges.forEach(roleChanges => {
      count += roleChanges.size;
    });
    return count;
  }, [pendingChanges]);

  // Get pending changes count for a specific role
  const getRolePendingCount = useCallback((roleName: AppRole) => {
    return pendingChanges.get(roleName)?.size || 0;
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

  // Check if a permission has pending changes for a role
  const isPendingPermission = useCallback((roleName: AppRole, permission: PermissionKey): boolean => {
    return pendingChanges.get(roleName)?.has(permission) || false;
  }, [pendingChanges]);

  // Sort categories in defined order
  const sortedCategories = useMemo(() => {
    const cats = Object.keys(permissionsByCategory);
    return cats.sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a);
      const bIndex = CATEGORY_ORDER.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [permissionsByCategory]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Handle toggle - updates local state only
  const handleTogglePermission = useCallback((role: AppRole, permission: PermissionKey, currentValue: boolean) => {
    const newValue = !currentValue;
    
    setPendingChanges(prev => {
      const next = new Map(prev);
      const roleChanges = new Map(next.get(role) || new Map());
      
      // Check if this change would revert to the current effective state
      const currentEffective = getEffectivePermissions(role);
      const isCurrentlyEnabled = currentEffective.includes(permission);
      
      if (newValue === isCurrentlyEnabled) {
        // Reverts to current state, remove from pending
        roleChanges.delete(permission);
      } else {
        roleChanges.set(permission, newValue);
      }
      
      if (roleChanges.size === 0) {
        next.delete(role);
      } else {
        next.set(role, roleChanges);
      }
      return next;
    });
  }, [getEffectivePermissions]);

  const handleResetRole = async (role: AppRole) => {
    setIsSaving(true);
    try {
      await resetToDefaults.mutateAsync(role);
      // Also clear any pending changes for this role
      setPendingChanges(prev => {
        const next = new Map(prev);
        next.delete(role);
        return next;
      });
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

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (roleToDelete) {
      await deleteRole.mutateAsync(roleToDelete.id);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const getOverrideCount = (roleName: AppRole) => {
    return permissions.filter((p) => isPermissionOverridden(roleName, p.key as PermissionKey)).length;
  };

  return (
    <div className="border rounded-lg overflow-hidden flex flex-col">
      <ScrollArea className="w-full flex-1">
        <div className="w-full">
          {/* Header Row */}
          <div className="flex border-b bg-muted/30 w-full">
            {/* Permission column header */}
            <div className="w-56 shrink-0 px-4 py-3 font-medium text-sm border-r sticky left-0 bg-muted/30 z-10">
              Permission
            </div>
            {/* Role column headers */}
            {roles.map((role) => {
              const overrideCount = getOverrideCount(role.name as AppRole);
              const pendingCount = getRolePendingCount(role.name as AppRole);
              
              return (
                <div
                  key={role.id}
                  className="flex-1 min-w-[100px] px-2 py-2 text-center border-r last:border-r-0"
                >
                  <div className="flex flex-col items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 font-medium text-xs hover:bg-muted gap-1"
                        >
                          {role.is_system && <Lock className="h-3 w-3 text-muted-foreground" />}
                          <span className="truncate max-w-[80px]">{role.label}</span>
                          <MoreVertical className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-40">
                        <DropdownMenuItem onClick={() => onEditRole(role)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                        {overrideCount > 0 && (
                          <DropdownMenuItem onClick={() => handleResetRole(role.name as AppRole)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset ({overrideCount})
                          </DropdownMenuItem>
                        )}
                        {!role.is_system && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteRole(role)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {pendingCount > 0 ? (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">{pendingCount} unsaved</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : overrideCount > 0 ? (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="w-2 h-2 rounded-full bg-warning" />
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">{overrideCount} overridden</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Permission Rows grouped by category */}
          {sortedCategories.map((category) => {
            const categoryPermissions = permissionsByCategory[category] || [];
            const isCollapsed = collapsedCategories.has(category);
            const categoryLabel = CATEGORY_LABELS[category] || category;

            return (
              <Collapsible
                key={category}
                open={!isCollapsed}
                onOpenChange={() => toggleCategory(category)}
              >
                {/* Category Header */}
                <CollapsibleTrigger asChild>
                  <div className="flex border-b bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors">
                    <div className="w-56 shrink-0 px-4 py-2 flex items-center gap-2 border-r sticky left-0 bg-muted/50 z-10">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {categoryLabel}
                      </span>
                    </div>
                    {/* Empty cells for alignment */}
                    {roles.map((role) => (
                      <div key={role.id} className="flex-1 min-w-[100px] border-r last:border-r-0" />
                    ))}
                  </div>
                </CollapsibleTrigger>

                {/* Permission Rows */}
                <CollapsibleContent>
                  {categoryPermissions.map((permission) => (
                    <PermissionRow
                      key={permission.id}
                      permission={permission}
                      roles={roles}
                      getDisplayPermissions={getDisplayPermissions}
                      isPermissionOverridden={isPermissionOverridden}
                      isPendingPermission={isPendingPermission}
                      onToggle={handleTogglePermission}
                      isUpdating={isSaving}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Legend & Save Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/20">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Checkbox checked className="h-3 w-3" disabled />
            <span>Enabled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Unsaved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span>Overridden</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            <span>System</span>
          </div>
        </div>
        
        {totalPendingCount > 0 && (
          <div className="flex items-center gap-3">
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete?.label}"?
              This action cannot be undone and will remove all permission assignments.
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

interface PermissionRowProps {
  permission: Permission;
  roles: Role[];
  getDisplayPermissions: (role: AppRole) => PermissionKey[];
  isPermissionOverridden: (role: AppRole, permission: PermissionKey) => boolean;
  isPendingPermission: (role: AppRole, permission: PermissionKey) => boolean;
  onToggle: (role: AppRole, permission: PermissionKey, currentValue: boolean) => void;
  isUpdating: boolean;
}

function PermissionRow({
  permission,
  roles,
  getDisplayPermissions,
  isPermissionOverridden,
  isPendingPermission,
  onToggle,
  isUpdating,
}: PermissionRowProps) {
  return (
    <div className="flex border-b last:border-b-0 hover:bg-muted/30 transition-colors w-full">
      {/* Permission name */}
      <div className="w-56 shrink-0 px-4 py-2 border-r sticky left-0 bg-background z-10">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                {permission.is_system && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                <span className="text-sm truncate">{permission.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[250px]">
              <p className="font-mono text-xs text-muted-foreground mb-1">{permission.key}</p>
              <p className="text-xs">{permission.description || "No description"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Checkboxes for each role */}
      {roles.map((role) => {
        const roleName = role.name as AppRole;
        const permissionKey = permission.key as PermissionKey;
        const displayPerms = getDisplayPermissions(roleName);
        const isEnabled = displayPerms.includes(permissionKey);
        const isOverridden = isPermissionOverridden(roleName, permissionKey);
        const isPending = isPendingPermission(roleName, permissionKey);

        return (
          <div
            key={role.id}
            className={cn(
              "flex-1 min-w-[100px] flex items-center justify-center border-r last:border-r-0",
              isPending && "bg-primary/5"
            )}
          >
            <div className="relative">
              <Checkbox
                checked={isEnabled}
                onCheckedChange={() => onToggle(roleName, permissionKey, isEnabled)}
                disabled={isUpdating}
                className="h-4 w-4"
              />
              {isPending ? (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
              ) : isOverridden ? (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-warning" />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
