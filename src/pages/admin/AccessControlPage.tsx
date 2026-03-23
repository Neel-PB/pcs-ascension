import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, List, LayoutPanelLeft } from "@/lib/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDynamicRoles } from "@/hooks/useDynamicRoles";
import { usePermissions } from "@/hooks/usePermissions";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { PermissionMatrix } from "@/components/admin/PermissionMatrix";
import { RoleDetailView } from "@/components/admin/RoleDetailView";
import { PermissionListView } from "@/components/admin/PermissionListView";
import { CORE_ROLES } from "@/config/rbacConfig";
import type { Role } from "@/types/rbac";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ViewMode = "matrix" | "detail" | "list";

export default function AccessControlPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("detail");
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [isPermissionFormOpen, setIsPermissionFormOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<Role | null>(null);

  const {
    manageableRoles: dynamicRoles,
    isLoading: rolesLoading,
    createRole,
    updateRole,
  } = useDynamicRoles();

  const {
    permissions,
    categories,
    isLoading: permissionsLoading,
    createPermission,
    corePermissions,
  } = usePermissions();

  const {
    isLoading: permissionMappingsLoading,
  } = useRolePermissions();

  // Core data (roles/permissions) is always available immediately
  // Only show loading if we're waiting for permission mappings (small table)
  const isExtensionsLoading = rolesLoading || permissionsLoading;
  const isLoading = permissionMappingsLoading;

  // Use core roles immediately while DB extensions load
  const displayRoles = dynamicRoles.length > 0 ? dynamicRoles : CORE_ROLES;
  const displayPermissions = permissions.length > 0 ? permissions : corePermissions;

  const handleRoleFormSubmit = async (data: { name: string; label: string; description?: string }) => {
    if (selectedRoleForEdit) {
      await updateRole.mutateAsync({ id: selectedRoleForEdit.id, data });
    } else {
      await createRole.mutateAsync(data);
    }
    setIsRoleFormOpen(false);
    setSelectedRoleForEdit(null);
  };

  const handlePermissionFormSubmit = async (data: { key: string; label: string; description?: string; category: string }) => {
    await createPermission.mutateAsync(data);
    setIsPermissionFormOpen(false);
  };

  // Only show skeleton if critical data (permission mappings) is still loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">RBAC</h3>
          <p className="text-sm text-muted-foreground">
            Manage roles and permissions in a unified view. Toggle permissions for each role.
            {isExtensionsLoading && (
              <span className="ml-2 text-xs text-muted-foreground/70">(Loading extensions...)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <TooltipProvider delayDuration={200}>
          <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
              className="bg-muted/50 p-0.5 rounded-md border border-border"
              variant="primary"
              data-tour="admin-rbac-views"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="matrix" 
                    aria-label="Matrix view" 
                    className={`h-8 px-2.5 ${viewMode === "matrix" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Matrix View</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="detail" 
                    aria-label="Detail view" 
                    className={`h-8 px-2.5 ${viewMode === "detail" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                  >
                    <LayoutPanelLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Role Detail View</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem 
                    value="list" 
                    aria-label="List view" 
                    className={`h-8 px-2.5 ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                  >
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Permission List</p>
                </TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </TooltipProvider>

          <div className="h-6 w-px bg-border" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2" data-tour="admin-rbac-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPermissionFormOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Permission
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedRoleForEdit(null);
                setIsRoleFormOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Role
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          data-tour="admin-rbac-content"
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === "matrix" && (
            <PermissionMatrix
              roles={displayRoles}
              onEditRole={(role) => {
                setSelectedRoleForEdit(role);
                setIsRoleFormOpen(true);
              }}
            />
          )}
          {viewMode === "detail" && (
            <RoleDetailView
              roles={displayRoles}
              onEditRole={(role) => {
                setSelectedRoleForEdit(role);
                setIsRoleFormOpen(true);
              }}
            />
          )}
          {viewMode === "list" && (
            <PermissionListView permissions={displayPermissions} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Role Form Dialog */}
      <RoleFormDialog
        open={isRoleFormOpen}
        onOpenChange={(open) => {
          setIsRoleFormOpen(open);
          if (!open) setSelectedRoleForEdit(null);
        }}
        role={selectedRoleForEdit}
        onSubmit={handleRoleFormSubmit}
        isLoading={createRole.isPending || updateRole.isPending}
      />

      {/* Permission Form Dialog */}
      <PermissionFormDialog
        open={isPermissionFormOpen}
        onOpenChange={setIsPermissionFormOpen}
        permission={null}
        categories={categories.length > 0 ? categories : ["modules", "settings", "filters", "subfilters", "approvals"]}
        onSubmit={handlePermissionFormSubmit}
        isLoading={createPermission.isPending}
      />
    </div>
  );
}
