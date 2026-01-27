import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import {
  PERMISSION_CATEGORIES,
  ROLE_METADATA,
  type AppRole,
  type PermissionKey,
} from "@/config/rbacConfig";
import { cn } from "@/lib/utils";

interface CompactRoleCardProps {
  role: AppRole;
  isSelected: boolean;
  permissionCount: number;
  overrideCount: number;
  onClick: () => void;
}

function CompactRoleCard({ role, isSelected, permissionCount, overrideCount, onClick }: CompactRoleCardProps) {
  const metadata = ROLE_METADATA[role];
  
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md border transition-all flex items-center justify-between gap-2",
              "hover:bg-muted/50",
              isSelected 
                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                : "border-transparent hover:border-border"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {overrideCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
              )}
              <span className="font-medium text-sm truncate">{metadata.label}</span>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0 h-5 px-1.5">
              {permissionCount}
            </Badge>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="text-xs">{metadata.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CompactPermissionRowProps {
  permissionKey: PermissionKey;
  label: string;
  description: string;
  isEnabled: boolean;
  isOverridden: boolean;
  isUpdating: boolean;
  onToggle: (checked: boolean) => void;
  onReset: () => void;
}

function CompactPermissionRow({
  label,
  description,
  isEnabled,
  isOverridden,
  isUpdating,
  onToggle,
  onReset,
}: CompactPermissionRowProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-2 min-w-0">
              <Checkbox
                checked={isEnabled}
                onCheckedChange={onToggle}
                disabled={isUpdating}
                className="h-3.5 w-3.5"
              />
              <span className="text-sm truncate">{label}</span>
              {isOverridden && (
                <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
              )}
            </div>
            {isOverridden && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
                disabled={isUpdating}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <p className="text-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CompactPermissionCardProps {
  title: string;
  permissions: Record<string, { label: string; description: string }>;
  role: AppRole;
  effectivePermissions: PermissionKey[];
  isPermissionOverridden: (role: AppRole, permission: PermissionKey) => boolean;
  onToggle: (permission: PermissionKey, value: boolean) => void;
  onReset: (permission: PermissionKey) => void;
  isUpdating: boolean;
}

function CompactPermissionCard({
  title,
  permissions,
  role,
  effectivePermissions,
  isPermissionOverridden,
  onToggle,
  onReset,
  isUpdating,
}: CompactPermissionCardProps) {
  const entries = Object.entries(permissions);
  const enabledCount = entries.filter(([key]) => 
    effectivePermissions.includes(key as PermissionKey)
  ).length;

  return (
    <div className="border rounded-md bg-card">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
        <Badge variant="secondary" className="text-xs h-4 px-1">
          {enabledCount}/{entries.length}
        </Badge>
      </div>
      <div className="p-1">
        {entries.map(([key, config]) => {
          const permissionKey = key as PermissionKey;
          const isEnabled = effectivePermissions.includes(permissionKey);
          const isOverridden = isPermissionOverridden(role, permissionKey);

          return (
            <CompactPermissionRow
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
      <div className="flex gap-4">
        <div className="w-44 space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Role Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Select a role and toggle permissions. Changes apply immediately.
        </p>
      </div>

      <div className="flex gap-4">
        {/* Left Panel - Compact Role List */}
        <div className="w-44 shrink-0 space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 mb-2">
            Roles
          </h4>
          <div className="space-y-1">
            {manageableRoles.map((role) => (
              <CompactRoleCard
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

        {/* Right Panel - Permission Grid */}
        <div className="flex-1 border rounded-lg">
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{ROLE_METADATA[selectedRole].label}</h4>
              <Badge variant="secondary" className="text-xs">
                {effectivePermissions.length} enabled
              </Badge>
            </div>
            {selectedOverrideCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleResetAll}
                disabled={isUpdating}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset ({selectedOverrideCount})
              </Button>
            )}
          </div>
          
          {/* 2x2 Permission Grid */}
          <div className="p-3 grid grid-cols-2 gap-3">
            <CompactPermissionCard
              title="Modules"
              permissions={PERMISSION_CATEGORIES.modules.permissions}
              role={selectedRole}
              effectivePermissions={effectivePermissions}
              isPermissionOverridden={isPermissionOverridden}
              onToggle={handleToggle}
              onReset={handleReset}
              isUpdating={isUpdating}
            />

            <div className="space-y-3">
              <CompactPermissionCard
                title="Settings"
                permissions={PERMISSION_CATEGORIES.settings.permissions}
                role={selectedRole}
                effectivePermissions={effectivePermissions}
                isPermissionOverridden={isPermissionOverridden}
                onToggle={handleToggle}
                onReset={handleReset}
                isUpdating={isUpdating}
              />

              <CompactPermissionCard
                title="Filters"
                permissions={PERMISSION_CATEGORIES.filters.permissions}
                role={selectedRole}
                effectivePermissions={effectivePermissions}
                isPermissionOverridden={isPermissionOverridden}
                onToggle={handleToggle}
                onReset={handleReset}
                isUpdating={isUpdating}
              />
            </div>

            <CompactPermissionCard
              title="Sub-filters"
              permissions={PERMISSION_CATEGORIES.subfilters.permissions}
              role={selectedRole}
              effectivePermissions={effectivePermissions}
              isPermissionOverridden={isPermissionOverridden}
              onToggle={handleToggle}
              onReset={handleReset}
              isUpdating={isUpdating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
