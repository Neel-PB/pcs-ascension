import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import {
  PERMISSION_CATEGORIES,
  ROLE_METADATA,
  DEFAULT_ROLE_PERMISSIONS,
  type AppRole,
  type PermissionKey,
} from "@/config/rbacConfig";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  role: AppRole;
  isSelected: boolean;
  permissionCount: number;
  overrideCount: number;
  onClick: () => void;
}

function RoleCard({ role, isSelected, permissionCount, overrideCount, onClick }: RoleCardProps) {
  const metadata = ROLE_METADATA[role];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all",
        "hover:bg-muted/50",
        isSelected 
          ? "border-primary bg-primary/5 ring-1 ring-primary" 
          : "border-border"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{metadata.label}</span>
        <Badge variant="secondary" className="text-xs">
          {permissionCount}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {metadata.description}
      </p>
      {overrideCount > 0 && (
        <Badge variant="outline" className="text-xs mt-2">
          {overrideCount} override{overrideCount !== 1 ? 's' : ''}
        </Badge>
      )}
    </button>
  );
}

interface PermissionRowProps {
  permissionKey: PermissionKey;
  label: string;
  description: string;
  isEnabled: boolean;
  isOverridden: boolean;
  isUpdating: boolean;
  onToggle: (checked: boolean) => void;
  onReset: () => void;
}

function PermissionRow({
  label,
  description,
  isEnabled,
  isOverridden,
  isUpdating,
  onToggle,
  onReset,
}: PermissionRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Checkbox
          checked={isEnabled}
          onCheckedChange={onToggle}
          disabled={isUpdating}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{label}</span>
            {isOverridden && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 shrink-0">
                Override
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
      </div>
      {isOverridden && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          disabled={isUpdating}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

interface PermissionCategorySectionProps {
  title: string;
  permissions: Record<string, { label: string; description: string }>;
  role: AppRole;
  effectivePermissions: PermissionKey[];
  isPermissionOverridden: (role: AppRole, permission: PermissionKey) => boolean;
  onToggle: (permission: PermissionKey, value: boolean) => void;
  onReset: (permission: PermissionKey) => void;
  isUpdating: boolean;
}

function PermissionCategorySection({
  title,
  permissions,
  role,
  effectivePermissions,
  isPermissionOverridden,
  onToggle,
  onReset,
  isUpdating,
}: PermissionCategorySectionProps) {
  const entries = Object.entries(permissions);
  const enabledCount = entries.filter(([key]) => 
    effectivePermissions.includes(key as PermissionKey)
  ).length;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 py-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        <Badge variant="secondary" className="text-xs">
          {enabledCount}/{entries.length}
        </Badge>
      </div>
      <div className="border rounded-lg divide-y">
        {entries.map(([key, config]) => {
          const permissionKey = key as PermissionKey;
          const isEnabled = effectivePermissions.includes(permissionKey);
          const isOverridden = isPermissionOverridden(role, permissionKey);

          return (
            <PermissionRow
              key={key}
              permissionKey={permissionKey}
              label={config.label}
              description={config.description}
              isEnabled={isEnabled}
              isOverridden={isOverridden}
              isUpdating={isUpdating}
              onToggle={(checked) => onToggle(permissionKey, checked)}
              onReset={() => onReset(permissionKey)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function RolesManagement() {
  const {
    manageableRoles,
    isLoading,
    getEffectivePermissions,
    isPermissionOverridden,
    setPermission,
    resetToDefaults,
  } = useRolePermissions();

  const [selectedRole, setSelectedRole] = useState<AppRole>(manageableRoles[0]);
  const [isUpdating, setIsUpdating] = useState(false);

  const effectivePermissions = getEffectivePermissions(selectedRole);

  // Count overrides for each role
  const getOverrideCount = (role: AppRole) => {
    return Object.values(PERMISSION_CATEGORIES)
      .flatMap(cat => Object.keys(cat.permissions))
      .filter(key => isPermissionOverridden(role, key as PermissionKey))
      .length;
  };

  const selectedOverrideCount = getOverrideCount(selectedRole);

  const handleToggle = async (permission: PermissionKey, value: boolean) => {
    setIsUpdating(true);
    try {
      await setPermission.mutateAsync({ role: selectedRole, permission, value });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async (permission: PermissionKey) => {
    setIsUpdating(true);
    try {
      await setPermission.mutateAsync({ role: selectedRole, permission, value: null });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetAll = async () => {
    setIsUpdating(true);
    try {
      await resetToDefaults.mutateAsync(selectedRole);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-6 h-[600px]">
        <div className="w-64 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Role Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Select a role to configure its permissions. Changes are applied immediately.
        </p>
      </div>

      <div className="flex gap-6 min-h-[500px]">
        {/* Left Panel - Role List */}
        <div className="w-64 shrink-0 space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
            Roles
          </h4>
          <div className="space-y-2">
            {manageableRoles.map((role) => (
              <RoleCard
                key={role}
                role={role}
                isSelected={role === selectedRole}
                permissionCount={getEffectivePermissions(role).length}
                overrideCount={getOverrideCount(role)}
                onClick={() => setSelectedRole(role)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Permission Editor */}
        <div className="flex-1 border rounded-lg">
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div>
              <h4 className="font-semibold">{ROLE_METADATA[selectedRole].label}</h4>
              <p className="text-sm text-muted-foreground">
                {effectivePermissions.length} permissions enabled
              </p>
            </div>
            {selectedOverrideCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAll}
                disabled={isUpdating}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset All ({selectedOverrideCount})
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[450px]">
            <div className="p-4 space-y-6">
              <PermissionCategorySection
                title="Module Access"
                permissions={PERMISSION_CATEGORIES.modules.permissions}
                role={selectedRole}
                effectivePermissions={effectivePermissions}
                isPermissionOverridden={isPermissionOverridden}
                onToggle={handleToggle}
                onReset={handleReset}
                isUpdating={isUpdating}
              />

              <PermissionCategorySection
                title="Settings Access"
                permissions={PERMISSION_CATEGORIES.settings.permissions}
                role={selectedRole}
                effectivePermissions={effectivePermissions}
                isPermissionOverridden={isPermissionOverridden}
                onToggle={handleToggle}
                onReset={handleReset}
                isUpdating={isUpdating}
              />

              <PermissionCategorySection
                title="Filter Access"
                permissions={PERMISSION_CATEGORIES.filters.permissions}
                role={selectedRole}
                effectivePermissions={effectivePermissions}
                isPermissionOverridden={isPermissionOverridden}
                onToggle={handleToggle}
                onReset={handleReset}
                isUpdating={isUpdating}
              />

              <PermissionCategorySection
                title="Sub-filter Access"
                permissions={PERMISSION_CATEGORIES.subfilters.permissions}
                role={selectedRole}
                effectivePermissions={effectivePermissions}
                isPermissionOverridden={isPermissionOverridden}
                onToggle={handleToggle}
                onReset={handleReset}
                isUpdating={isUpdating}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
