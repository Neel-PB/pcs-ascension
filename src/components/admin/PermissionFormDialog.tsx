import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Permission, PermissionFormData } from "@/hooks/usePermissions";

interface PermissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission?: Permission | null;
  categories: string[];
  onSubmit: (data: PermissionFormData) => void;
  isLoading?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  modules: "Module Access",
  settings: "Settings Access",
  filters: "Filter Access",
  subfilters: "Sub-filter Access",
};

export function PermissionFormDialog({
  open,
  onOpenChange,
  permission,
  categories,
  onSubmit,
  isLoading,
}: PermissionFormDialogProps) {
  const [key, setKey] = useState(permission?.key || "");
  const [label, setLabel] = useState(permission?.label || "");
  const [description, setDescription] = useState(permission?.description || "");
  const [category, setCategory] = useState(permission?.category || categories[0] || "modules");

  const isEditing = !!permission;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!key.trim() || !label.trim() || !category) {
      return;
    }

    onSubmit({
      key: key.trim().toLowerCase().replace(/\s+/g, '.'),
      label: label.trim(),
      description: description.trim() || undefined,
      category,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setKey(permission?.key || "");
      setLabel(permission?.label || "");
      setDescription(permission?.description || "");
      setCategory(permission?.category || categories[0] || "modules");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Permission" : "Add New Permission"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the permission details. Key cannot be changed."
              : "Create a new permission that can be assigned to roles."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Permission Key</Label>
            <Input
              id="key"
              placeholder="e.g., positions.delete"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={isEditing || isLoading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use format: category.action (e.g., positions.delete)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Display Label</Label>
            <Input
              id="label"
              placeholder="e.g., Delete Positions"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this permission controls..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={2}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Permission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
