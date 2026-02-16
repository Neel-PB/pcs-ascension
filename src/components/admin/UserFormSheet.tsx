import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "@/lib/icons";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MultiSelectChips, type MultiSelectOption } from "@/components/ui/multi-select-chips";
import { useDynamicRoles } from "@/hooks/useDynamicRoles";
import type { UserWithProfile, UserRole } from "@/hooks/useUsers";

const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  roles: z.array(z.string()).min(1, "At least one role is required"),
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
  const [orgAccessOpen, setOrgAccessOpen] = useState(false);
  const [pendingAccessScope, setPendingAccessScope] = useState<AccessScopeData | null>(null);
  
  // Handle access scope changes from AccessScopeManager
  const handleAccessChange = useCallback((data: AccessScopeData) => {
    setPendingAccessScope(data);
  }, []);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      roles: ["labor_team"],
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
        roles: user.roles.length > 0 ? user.roles : ["labor_team"],
        bio: user.bio || "",
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        roles: ["labor_team"],
        bio: "",
      });
      // Reset pending access scope for new user
      setPendingAccessScope(null);
    }
  }, [user, form]);

  const handleSubmit = async (data: UserFormValues) => {
    if (isEditMode) {
      // Trigger access scope save if available
      if ((window as any).__accessScopeSave) {
        await (window as any).__accessScopeSave();
      }
      
      onSubmit({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        roles: data.roles,
      });
    } else {
      // Include access scope data for new user
      onSubmit({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        roles: data.roles,
        accessScope: pendingAccessScope,
      });
    }
  };

  // Build role options for MultiSelectChips
  const roleOptions: MultiSelectOption[] = manageableRoles
    .filter((role) => role.name && role.name.trim() !== '')
    .map((role) => ({
      value: role.name,
      label: role.label,
      description: role.description || undefined,
      isSystem: role.is_system,
    }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-xl flex h-full flex-col p-0" 
        hideCloseButton
      >
        <div
          className="shrink-0 px-6 border-b border-border flex flex-col justify-center"
          style={{ height: 'var(--header-height)' }}
        >
          <h2 className="text-lg font-semibold">
            {isEditMode ? 'Edit User' : 'Invite New User'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Update user information and roles'
              : 'Send an invitation email to create a new user account'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1">
              <div className="px-6 py-6 space-y-6">
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
                  name="roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roles</FormLabel>
                      <FormControl>
                        <MultiSelectChips
                          options={roleOptions}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Search roles..."
                          addButtonText="Add Role"
                          emptyText="No roles selected"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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

                {/* Organization Access Section - Show for both create and edit modes */}
                <Collapsible open={orgAccessOpen} onOpenChange={setOrgAccessOpen} data-tour="admin-users-scope">
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:underline">
                    <span>Access Scope Restrictions</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${orgAccessOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <AccessScopeManager 
                      userId={user?.id} 
                      isEditMode={isEditMode}
                      onAccessChange={!isEditMode ? handleAccessChange : undefined}
                    />
                  </CollapsibleContent>
                </Collapsible>
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
                  {isSubmitting ? 'Sending...' : isEditMode ? 'Update' : 'Send Invite'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
