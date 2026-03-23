import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AccessScopeManager, type AccessScopeData } from "./AccessScopeManager";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDynamicRoles } from "@/hooks/useDynamicRoles";
import type { UserWithProfile } from "@/hooks/useUsers";

const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  role: z.string().min(1, "Role is required"),
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
  const [pendingAccessScope, setPendingAccessScope] = useState<AccessScopeData | null>(null);

  const handleAccessChange = useCallback((data: AccessScopeData) => {
    setPendingAccessScope(data);
  }, []);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        role: user.role || "user",
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        role: "user",
      });
      setPendingAccessScope(null);
    }
  }, [user, form]);

  const handleSubmit = async (data: UserFormValues) => {
    if (isEditMode) {
      onSubmit({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        accessScope: pendingAccessScope,
      });
    } else {
      onSubmit({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        accessScope: pendingAccessScope,
      });
    }
  };

  const roleOptions = manageableRoles
    .filter((role) => role.name && role.name.trim() !== "")
    .map((role) => ({
      value: role.name,
      label: role.label,
      description: role.description || undefined,
    }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-xl flex h-full flex-col p-0"
        hideCloseButton
      >
        <div
          className="shrink-0 px-6 border-b border-border flex flex-col justify-center"
          style={{ height: "var(--header-height)" }}
        >
          <h2 className="text-lg font-semibold">
            {isEditMode ? "Edit User" : "Invite New User"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Update user information and role"
              : "Send an invitation email to create a new user account"}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <ScrollArea className="flex-1">
              <div className="px-6 py-5 space-y-4">
                {/* Names side-by-side */}
                <div className="grid grid-cols-2 gap-3">
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
                </div>

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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roleOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Access Scope Section */}
                <div data-tour="admin-users-scope">
                  <h4 className="text-sm font-medium mb-2">Access Scope</h4>
                  <AccessScopeManager
                    userId={user?.id}
                    isEditMode={isEditMode}
                    onAccessChange={handleAccessChange}
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="shrink-0 px-6 py-4 border-t border-border bg-background">
              <div className="flex gap-3">
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
                  {isSubmitting
                    ? "Sending..."
                    : isEditMode
                    ? "Update"
                    : "Send Invite"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
