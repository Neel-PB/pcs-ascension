import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { OrgAccessManager } from "./OrgAccessManager";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Lock } from "lucide-react";
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
    }
  }, [user, form]);

  const handleSubmit = (data: UserFormValues) => {
    if (isEditMode) {
      onSubmit({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        roles: data.roles,
      });
    } else {
      onSubmit({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        role: data.roles[0], // For invite, use first role
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
              name="roles"
              render={() => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <div className="space-y-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                    {manageableRoles
                      .filter((role) => role.name && role.name.trim() !== '')
                      .map((role) => (
                        <FormField
                          key={role.id}
                          control={form.control}
                          name="roles"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={role.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(role.name)}
                                    onCheckedChange={(checked) => {
                                      const currentRoles = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentRoles, role.name]);
                                      } else {
                                        field.onChange(
                                          currentRoles.filter((r: string) => r !== role.name)
                                        );
                                      }
                                    }}
                                    disabled={rolesLoading}
                                  />
                                </FormControl>
                                <div className="flex items-center gap-2 leading-none">
                                  {role.is_system && <Lock className="h-3 w-3 text-muted-foreground" />}
                                  <span className="text-sm font-medium">{role.label}</span>
                                  {role.description && (
                                    <span className="text-xs text-muted-foreground">
                                      - {role.description}
                                    </span>
                                  )}
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                  </div>
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

            {/* Organization Access Section - Only show in edit mode */}
            {isEditMode && user && (
              <Collapsible open={orgAccessOpen} onOpenChange={setOrgAccessOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:underline">
                  <span>Organization Access Restrictions</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${orgAccessOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <OrgAccessManager userId={user.id} isEditMode={isEditMode} />
                </CollapsibleContent>
              </Collapsible>
            )}

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
