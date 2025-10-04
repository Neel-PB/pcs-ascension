import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { UserFormSheet } from "@/components/admin/UserFormSheet";
import { useUsers, type UserWithProfile } from "@/hooks/useUsers";

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);

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

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsSheetOpen(true);
  };

  const handleEditUser = (user: UserWithProfile) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedUser) {
      updateUser(data);
    } else {
      createUser(data);
    }
    setIsSheetOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = (userId: string) => {
    deleteUser(userId);
  };

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <UserManagementTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDelete}
        isLoading={isLoading}
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
