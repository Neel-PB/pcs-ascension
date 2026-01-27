import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Role, RoleFormData } from "@/hooks/useDynamicRoles";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSubmit: (data: RoleFormData) => void;
  isLoading?: boolean;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSubmit,
  isLoading,
}: RoleFormDialogProps) {
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  const isEditing = !!role;

  // Reset form when role changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(role?.name || "");
      setLabel(role?.label || "");
      setDescription(role?.description || "");
    }
  }, [open, role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!label.trim()) {
      return;
    }

    // For new roles, generate name from label
    const roleName = isEditing
      ? role?.name || ""
      : label.trim().toLowerCase().replace(/\s+/g, '_');

    onSubmit({
      name: roleName,
      label: label.trim(),
      description: description.trim() || undefined,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName("");
      setLabel("");
      setDescription("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Role" : "Add New Role"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the role details. The role key cannot be changed."
              : "Create a new role that can be assigned to users."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Display Name</Label>
            <Input
              id="label"
              placeholder="e.g., Quality Assurance"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">
                Role Key (read-only)
              </Label>
              <Input
                id="name"
                value={role?.name || ""}
                disabled
                className="bg-muted"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this role's responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !label.trim()}>
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
