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
import { Pencil, Trash2 } from "lucide-react";
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

interface UserManagementTableProps {
  users: UserWithProfile[];
  onEdit: (user: UserWithProfile) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'moderator':
      return 'default';
    default:
      return 'secondary';
  }
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
        <div className="p-8 text-center text-muted-foreground">
          Loading users...
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
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
            const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U';

            return (
              <TableRow key={user.id}>
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
                  <div className="flex gap-1 flex-wrap">
                    {user.roles.map((role) => (
                      <Badge
                        key={role}
                        variant={getRoleBadgeVariant(role)}
                        className="capitalize"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(user.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      title="Edit user"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
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
