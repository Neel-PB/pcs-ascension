import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdOutlineEdit, MdOutlineDelete } from 'react-icons/md';
import type { UserWithProfile } from "@/hooks/useUsers";
import { format } from "date-fns";
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
} from "@/components/ui/alert-dialog";
import { LogoLoader } from "@/components/ui/LogoLoader";

interface UserManagementTableProps {
  users: UserWithProfile[];
  onEdit: (user: UserWithProfile) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive' as const;
    case 'labor_team':
      return 'default' as const;
    default:
      return 'secondary' as const;
  }
};

const getRoleDisplayName = (role: string | undefined | null): string => {
  if (!role) return 'No Role';
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export function UserManagementTable({
  users,
  onEdit,
  onDelete,
  isLoading,
}: UserManagementTableProps) {
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
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead className="whitespace-nowrap">Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead className="whitespace-nowrap">Created</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.filter(user => user != null).map((user) => {
            const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown User';
            const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U';

            return (
              <TableRow key={user.id} className="cursor-pointer" onClick={() => onEdit(user)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{fullName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email || 'No email'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(user.roles || []).map((role) => (
                      <Badge key={role} variant={getRoleBadgeVariant(role)}>
                        {getRoleDisplayName(role)}
                      </Badge>
                    ))}
                    {(!user.roles || user.roles.length === 0) && (
                      <Badge variant="secondary">No Role</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {format(new Date(user.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(user)}
                      title="Edit user"
                    >
                      <MdOutlineEdit size={16} className="text-muted-foreground" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Delete user"
                        >
                          <MdOutlineDelete size={16} className="text-muted-foreground" />
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
                            onClick={() => onDelete(user.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
