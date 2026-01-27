import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock } from "lucide-react";
import { useDynamicRoles } from "@/hooks/useDynamicRoles";
import type { UserWithProfile, UserRole } from "@/hooks/useUsers";

const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  role: z.string().min(1, "Role is required"),
  bio: z.string().max(500).optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserWithProfile | null;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export function UserFormSheet({
  open,
  onOpenChange,
  user,
  onSubmit,
  isSubmitting,
}: UserFormSheetProps) {
  const isEditMode = !!user;
  const { manageableRoles, isLoading: rolesLoading } = useDynamicRoles();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "labor_team",
      bio: "",
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        role: user.role || "labor_team",
        bio: user.bio || "",
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        role: "labor_team",
        bio: "",
      });
    }
  }, [user, form]);

  const handleSubmit = (data: UserFormValues) => {
    if (isEditMode) {
      onSubmit({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        role: data.role,
      });
    } else {
      onSubmit({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        role: data.role,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Edit User' : 'Invite New User'}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? 'Update user information and roles'
              : 'Send an invitation email to create a new user account'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      disabled={isEditMode}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => {
                const selectedRole = manageableRoles.find(r => r.name === field.value);

                return (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={rolesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {manageableRoles
                          .filter((role) => role.name && role.name.trim() !== '')
                          .map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              <div className="flex items-center gap-2">
                                {role.is_system && <Lock className="h-3 w-3 text-muted-foreground" />}
                                <span>{role.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {selectedRole?.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedRole.description}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about this user..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Sending...' : isEditMode ? 'Update' : 'Send Invite'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
