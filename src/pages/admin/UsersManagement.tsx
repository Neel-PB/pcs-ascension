import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/ui/search-field";
import { UserPlus } from "@/lib/icons";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { UserFormSheet } from "@/components/admin/UserFormSheet";
import { useUsers, type UserWithProfile } from "@/hooks/useUsers";

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [sortField, setSortField] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>();

  const {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    isCreating,
    isUpdating,
  } = useUsers();

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  // Sort filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    const dir = sortDirection === 'asc' ? 1 : -1;
    
    let valA: string = '';
    let valB: string = '';
    
    switch (sortField) {
      case 'name':
        valA = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase();
        valB = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase();
        break;
      case 'email':
        valA = (a.email || '').toLowerCase();
        valB = (b.email || '').toLowerCase();
        break;
      case 'roles':
        valA = (a.roles || []).join(',').toLowerCase();
        valB = (b.roles || []).join(',').toLowerCase();
        break;
      case 'created_at':
        valA = a.created_at || '';
        valB = b.created_at || '';
        break;
      default:
        return 0;
    }
    
    return valA < valB ? -dir : valA > valB ? dir : 0;
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsSheetOpen(true);
  };

  const handleEditUser = useCallback((user: UserWithProfile) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  }, []);

  const handleSubmit = (data: any) => {
    if (selectedUser) {
      updateUser(data);
    } else {
      createUser(data);
    }
    setIsSheetOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = useCallback((userId: string) => {
    deleteUser(userId);
  }, [deleteUser]);

  const handleSort = useCallback((columnId: string, direction: 'asc' | 'desc') => {
    setSortField(columnId);
    setSortDirection(direction);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Users</h3>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={handleAddUser} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <SearchField
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <p className="text-xs text-muted-foreground">
        Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
      </p>

      <UserManagementTable
        users={sortedUsers}
        onEdit={handleEditUser}
        onDelete={handleDelete}
        isLoading={isLoading}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      <UserFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        user={selectedUser}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}
