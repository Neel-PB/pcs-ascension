import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Grid3X3, List, LayoutPanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDynamicRoles, type Role } from "@/hooks/useDynamicRoles";
import { usePermissions } from "@/hooks/usePermissions";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { RoleFormDialog } from "@/components/admin/RoleFormDialog";
import { PermissionFormDialog } from "@/components/admin/PermissionFormDialog";
import { PermissionMatrix } from "@/components/admin/PermissionMatrix";
import { RoleDetailView } from "@/components/admin/RoleDetailView";
import { PermissionListView } from "@/components/admin/PermissionListView";
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
  } = usePermissions();

  const {
    isLoading: permissionMappingsLoading,
  } = useRolePermissions();

  const isLoading = rolesLoading || permissionsLoading || permissionMappingsLoading;

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
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <TooltipProvider delayDuration={200}>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
              className="bg-muted/50 p-0.5 rounded-md"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="matrix" aria-label="Matrix view" className="h-8 px-2.5">
                    <Grid3X3 className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Matrix View</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="detail" aria-label="Detail view" className="h-8 px-2.5">
                    <LayoutPanelLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Role Detail View</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="list" aria-label="List view" className="h-8 px-2.5">
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

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === "matrix" && (
            <PermissionMatrix
              roles={dynamicRoles}
              onEditRole={(role) => {
                setSelectedRoleForEdit(role);
                setIsRoleFormOpen(true);
              }}
            />
          )}
          {viewMode === "detail" && (
            <RoleDetailView
              roles={dynamicRoles}
              onEditRole={(role) => {
                setSelectedRoleForEdit(role);
                setIsRoleFormOpen(true);
              }}
            />
          )}
          {viewMode === "list" && (
            <PermissionListView permissions={permissions} />
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
