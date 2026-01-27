import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Lock, MoreVertical, Pencil, Trash2, Copy, RotateCcw } from "lucide-react";
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

interface PermissionMatrixProps {
  roles: Role[];
  onEditRole: (role: Role) => void;
}

const CATEGORY_ORDER = ["modules", "settings", "filters", "subfilters", "approvals"];
const CATEGORY_LABELS: Record<string, string> = {
  modules: "Modules",
  settings: "Settings",
  filters: "Filters",
  subfilters: "Sub-filters",
  approvals: "Approvals",
};

export function PermissionMatrix({ roles, onEditRole }: PermissionMatrixProps) {
  const { permissions, permissionsByCategory } = usePermissions();
  const { getEffectivePermissions, isPermissionOverridden, setPermission, resetToDefaults } = useRolePermissions();
  const { deleteRole } = useDynamicRoles();

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleTogglePermission = async (role: AppRole, permission: PermissionKey, currentValue: boolean) => {
    setIsUpdating(true);
    try {
      await setPermission.mutateAsync({ role, permission, value: !currentValue });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetRole = async (role: AppRole) => {
    setIsUpdating(true);
    try {
      await resetToDefaults.mutateAsync(role);
    } finally {
      setIsUpdating(false);
    }
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
    }
  };

  const getOverrideCount = (roleName: AppRole) => {
    return permissions.filter((p) => isPermissionOverridden(roleName, p.key as PermissionKey)).length;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <ScrollArea className="w-full">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="flex border-b bg-muted/30">
            {/* Permission column header */}
            <div className="w-56 shrink-0 px-4 py-3 font-medium text-sm border-r sticky left-0 bg-muted/30 z-10">
              Permission
            </div>
            {/* Role column headers */}
            {roles.map((role) => {
              const overrideCount = getOverrideCount(role.name as AppRole);
              const effectivePerms = getEffectivePermissions(role.name as AppRole);
              
              return (
                <div
                  key={role.id}
                  className="w-28 shrink-0 px-2 py-2 text-center border-r last:border-r-0"
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
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-[10px] h-4 px-1">
                        {effectivePerms.length}
                      </Badge>
                      {overrideCount > 0 && (
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
                      )}
                    </div>
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
                      <Badge variant="outline" className="text-[10px] h-4 px-1 ml-auto">
                        {categoryPermissions.length}
                      </Badge>
                    </div>
                    {/* Empty cells for alignment */}
                    {roles.map((role) => (
                      <div key={role.id} className="w-28 shrink-0 border-r last:border-r-0" />
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
                      getEffectivePermissions={getEffectivePermissions}
                      isPermissionOverridden={isPermissionOverridden}
                      onToggle={handleTogglePermission}
                      isUpdating={isUpdating}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Checkbox checked className="h-3 w-3" disabled />
          <span>Enabled</span>
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
  getEffectivePermissions: (role: AppRole) => PermissionKey[];
  isPermissionOverridden: (role: AppRole, permission: PermissionKey) => boolean;
  onToggle: (role: AppRole, permission: PermissionKey, currentValue: boolean) => void;
  isUpdating: boolean;
}

function PermissionRow({
  permission,
  roles,
  getEffectivePermissions,
  isPermissionOverridden,
  onToggle,
  isUpdating,
}: PermissionRowProps) {
  return (
    <div className="flex border-b last:border-b-0 hover:bg-muted/30 transition-colors">
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
        const effectivePerms = getEffectivePermissions(roleName);
        const isEnabled = effectivePerms.includes(permissionKey);
        const isOverridden = isPermissionOverridden(roleName, permissionKey);

        return (
          <div
            key={role.id}
            className="w-28 shrink-0 flex items-center justify-center border-r last:border-r-0"
          >
            <div className="relative">
              <Checkbox
                checked={isEnabled}
                onCheckedChange={() => onToggle(roleName, permissionKey, isEnabled)}
                disabled={isUpdating}
                className="h-4 w-4"
              />
              {isOverridden && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-warning" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
