import { ColumnDef } from '@/types/table';
import { UserWithProfile } from '@/hooks/useUsers';
import { TruncatedTextCell } from '@/components/editable-table/cells/TruncatedTextCell';
import { DateCell } from '@/components/editable-table/cells/DateCell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MdOutlineEdit, MdOutlineDelete } from 'react-icons/md';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CellButton } from '@/components/editable-table/cells/CellButton';

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive' as const;
    case 'labor_team':
      return 'default' as const;
    default:
      return 'outline' as const;
  }
};

const getRoleDisplayName = (role: string): string => {
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const createUserColumns = (
  onEdit: (user: UserWithProfile) => void,
  onDelete: (userId: string) => void,
): ColumnDef<UserWithProfile>[] => [
  {
    id: 'name',
    label: 'User',
    type: 'custom',
    width: 280,
    minWidth: 240,
    sortable: true,
    resizable: false,
    draggable: true,
    locked: true,
    getValue: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    renderCell: (row) => {
      const fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown User';
      const initials = `${row.first_name?.[0] || ''}${row.last_name?.[0] || ''}`.toUpperCase() || 'U';
      return (
        <CellButton className="flex items-center gap-3">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={row.avatar_url || undefined} />
            <AvatarFallback className="bg-[#1E69D2] text-white text-xs font-medium">{initials}</AvatarFallback>
          </Avatar>
          <span className="truncate font-medium">{fullName}</span>
        </CellButton>
      );
    },
  },
  {
    id: 'email',
    label: 'Email',
    type: 'custom',
    width: 260,
    minWidth: 220,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => (
      <TruncatedTextCell value={row.email || 'No email'} />
    ),
  },
  {
    id: 'role',
    label: 'Role',
    type: 'custom',
    width: 200,
    minWidth: 160,
    sortable: true,
    resizable: false,
    draggable: true,
    getValue: (row) => getRoleDisplayName(row.role || 'user'),
    renderCell: (row) => (
      <CellButton className="flex items-center gap-1">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {getRoleDisplayName(row.role || 'user')}
        </span>
      </CellButton>
    ),
  },
  {
    id: 'created_at',
    label: 'Created',
    type: 'custom',
    width: 160,
    minWidth: 140,
    sortable: true,
    resizable: false,
    draggable: true,
    renderCell: (row) => (
      <DateCell value={row.created_at} formatString="MMM d, yyyy" />
    ),
  },
  {
    id: 'actions',
    label: 'Actions',
    type: 'custom',
    width: 100,
    minWidth: 100,
    sortable: false,
    resizable: false,
    draggable: false,
    renderHeader: () => <span data-tour="admin-users-actions">Actions</span>,
    renderCell: (row) => {
      const fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown User';
      return (
        <div className="flex items-center justify-end gap-1 px-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(row)}
            title="Edit user"
          >
            <MdOutlineEdit size={15} className="text-muted-foreground" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Delete user"
              >
                <MdOutlineDelete size={15} className="text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {fullName}'s account.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(row.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
