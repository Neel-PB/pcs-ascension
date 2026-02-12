import { useMemo } from 'react';
import { EditableTable } from '@/components/editable-table/EditableTable';
import { createUserColumns } from '@/config/userColumns';
import type { UserWithProfile } from '@/hooks/useUsers';
import { LogoLoader } from '@/components/ui/LogoLoader';

interface UserManagementTableProps {
  users: UserWithProfile[];
  onEdit: (user: UserWithProfile) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void;
}

export function UserManagementTable({
  users,
  onEdit,
  onDelete,
  isLoading,
  sortField,
  sortDirection,
  onSort,
}: UserManagementTableProps) {
  const columns = useMemo(() => createUserColumns(onEdit, onDelete), [onEdit, onDelete]);

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="flex justify-center items-center py-12">
          <LogoLoader size="lg" />
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center text-muted-foreground">
          No users found. Click "Add User" to create one.
        </div>
      </div>
    );
  }

  return (
    <EditableTable
      columns={columns}
      data={users}
      getRowId={(row) => row.id}
      onRowClick={onEdit}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      storeNamespace="admin-users-columns-v1"
      className="h-full"
    />
  );
}
