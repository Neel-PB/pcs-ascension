import { useState } from "react";
import { Plus, MoreVertical, Pencil, Trash2, Lock } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/search-field";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermissions, type Permission } from "@/hooks/usePermissions";
import { PermissionFormDialog } from "@/components/admin/PermissionFormDialog";

const CATEGORY_LABELS: Record<string, string> = {
  modules: "Module Access",
  settings: "Settings Access",
  filters: "Filter Access",
  subfilters: "Sub-filter Access",
  approvals: "Approval Access",
};

export default function PermissionsManagement() {
  const {
    permissions,
    permissionsByCategory,
    categories,
    isLoading,
    createPermission,
    updatePermission,
    deletePermission,
  } = usePermissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);

  // Filter permissions
  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      permission.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (permission.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesCategory = categoryFilter === "all" || permission.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Group filtered permissions by category
  const groupedPermissions = filteredPermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

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
    } else {
      await createPermission.mutateAsync(data);
    }
    setIsFormOpen(false);
    setSelectedPermission(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Permission Management</h3>
        <p className="text-sm text-muted-foreground">
          Create and manage permissions that can be assigned to roles.
        </p>
      </div>

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

        <Button
          onClick={() => {
            setSelectedPermission(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Permission
        </Button>
      </div>

      {/* Permissions Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Key</TableHead>
              <TableHead className="w-[180px]">Label</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[80px]">Type</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              perms.map((permission, index) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-mono text-sm">
                    {permission.key}
                  </TableCell>
                  <TableCell>{permission.label}</TableCell>
                  <TableCell>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[category] || category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                    {permission.description || "—"}
                  </TableCell>
                  <TableCell>
                    {permission.is_system ? (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Lock className="h-3 w-3" />
                        System
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Custom
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(permission)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!permission.is_system && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(permission)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ))}
            {filteredPermissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No permissions found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <PermissionFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedPermission(null);
        }}
        permission={selectedPermission}
        categories={categories.length > 0 ? categories : ["modules", "settings", "filters", "subfilters"]}
        onSubmit={handleFormSubmit}
        isLoading={createPermission.isPending || updatePermission.isPending}
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
