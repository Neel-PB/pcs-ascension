import { useState, useMemo } from "react";
import { Lock, MoreVertical, Pencil, Trash2 } from "@/lib/icons";
import { SearchField } from "@/components/ui/search-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { type Permission, usePermissions } from "@/hooks/usePermissions";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useDynamicRoles } from "@/hooks/useDynamicRoles";
import { PermissionFormDialog } from "@/components/admin/PermissionFormDialog";
import { type AppRole, type PermissionKey } from "@/config/rbacConfig";

const CATEGORY_LABELS: Record<string, string> = {
  modules: "Module Access",
  settings: "Settings Access",
  filters: "Filter Access",
  subfilters: "Sub-filter Access",
  approvals: "Approval Access",
};

const CATEGORY_ORDER = ["modules", "settings", "filters", "subfilters", "approvals"];

interface PermissionListViewProps {
  permissions: Permission[];
}

interface PermissionCardProps {
  permission: Permission;
  assignedRoles: { id: string; label: string }[];
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
}

function PermissionCard({ permission, assignedRoles, onEdit, onDelete }: PermissionCardProps) {
  return (
    <div className="px-4 py-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Label + System badge */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{permission.label}</span>
            {permission.is_system && (
              <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
          </div>
          
          {/* Key (monospace, smaller) */}
          <code className="text-xs text-muted-foreground font-mono block">
            {permission.key}
          </code>
          
          {/* Full description */}
          <p className="text-sm text-muted-foreground">
            {permission.description || "No description provided"}
          </p>
        </div>
        
        {/* Assigned Roles */}
        <div className="flex flex-wrap gap-1 max-w-[280px] justify-end shrink-0">
          {assignedRoles.slice(0, 4).map((role) => (
            <Badge key={role.id} variant="outline" className="text-xs">
              {role.label}
            </Badge>
          ))}
          {assignedRoles.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{assignedRoles.length - 4}
            </Badge>
          )}
          {assignedRoles.length === 0 && (
            <span className="text-xs text-muted-foreground italic">No roles assigned</span>
          )}
        </div>
        
        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(permission)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {!permission.is_system && (
              <DropdownMenuItem
                onClick={() => onDelete(permission)}
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
  );
}

export function PermissionListView({ permissions }: PermissionListViewProps) {
  const { categories, updatePermission, deletePermission } = usePermissions();
  const { getEffectivePermissions } = useRolePermissions();
  const { manageableRoles } = useDynamicRoles();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);

  // Filter permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter((permission) => {
      const matchesSearch =
        permission.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (permission.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesCategory = categoryFilter === "all" || permission.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [permissions, searchQuery, categoryFilter]);

  // Group filtered permissions by category
  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce(
      (acc, permission) => {
        if (!acc[permission.category]) {
          acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
  }, [filteredPermissions]);

  // Sort categories in logical order
  const sortedCategories = useMemo(() => {
    return Object.keys(groupedPermissions).sort((a, b) => {
      const aIndex = CATEGORY_ORDER.indexOf(a);
      const bIndex = CATEGORY_ORDER.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [groupedPermissions]);

  // Get roles that have a permission
  const getRolesWithPermission = (permissionKey: string) => {
    return manageableRoles.filter((role) => {
      const effectivePerms = getEffectivePermissions(role.name as AppRole);
      return effectivePerms.includes(permissionKey as PermissionKey);
    });
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsFormOpen(true);
  };

  const handleDelete = (permission: Permission) => {
    setPermissionToDelete(permission);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (permissionToDelete) {
      await deletePermission.mutateAsync(permissionToDelete.id);
      setDeleteDialogOpen(false);
      setPermissionToDelete(null);
    }
  };

  const handleFormSubmit = async (data: { key: string; label: string; description?: string; category: string }) => {
    if (selectedPermission) {
      await updatePermission.mutateAsync({ id: selectedPermission.id, data });
    }
    setIsFormOpen(false);
    setSelectedPermission(null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <SearchField
          placeholder="Search permissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-sm"
        />

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat] || cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Permissions by Category */}
      <div className="border rounded-lg overflow-hidden">
        {sortedCategories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No permissions found matching your criteria.
          </div>
        ) : (
          sortedCategories.map((category) => {
            const categoryPermissions = groupedPermissions[category] || [];
            if (categoryPermissions.length === 0) return null;

            return (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center justify-between gap-2 py-2.5 px-4 bg-muted/50 border-b sticky top-0 z-10">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    {CATEGORY_LABELS[category] || category}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {categoryPermissions.length}
                  </Badge>
                </div>

                {/* Permission Cards */}
                <div className="divide-y divide-border/50">
                  {categoryPermissions.map((permission) => {
                    const assignedRoles = getRolesWithPermission(permission.key);
                    return (
                      <PermissionCard
                        key={permission.id}
                        permission={permission}
                        assignedRoles={assignedRoles}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Dialog */}
      <PermissionFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedPermission(null);
        }}
        permission={selectedPermission}
        categories={categories.length > 0 ? categories : ["modules", "settings", "filters", "subfilters", "approvals"]}
        onSubmit={handleFormSubmit}
        isLoading={updatePermission.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the permission "{permissionToDelete?.label}"?
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
    </div>
  );
}
