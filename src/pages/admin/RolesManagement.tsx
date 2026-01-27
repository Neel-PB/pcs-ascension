import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, RotateCcw, Check, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import {
  PERMISSION_CATEGORIES,
  ROLE_METADATA,
  DEFAULT_ROLE_PERMISSIONS,
  type AppRole,
  type PermissionKey,
} from "@/config/rbacConfig";
import { cn } from "@/lib/utils";

interface PermissionToggleProps {
  role: AppRole;
  permissionKey: PermissionKey;
  label: string;
  description: string;
  isEnabled: boolean;
  isDefault: boolean;
  isOverridden: boolean;
  isUpdating: boolean;
  onToggle: (value: boolean) => void;
  onReset: () => void;
}

function PermissionToggle({
  role,
  permissionKey,
  label,
  description,
  isEnabled,
  isDefault,
  isOverridden,
  isUpdating,
  onToggle,
  onReset,
}: PermissionToggleProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            {isOverridden && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                Override
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isOverridden && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReset();
                  }}
                  disabled={isUpdating}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset to default</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <div className={cn("flex items-center gap-1.5", isEnabled ? "text-primary" : "text-muted-foreground")}>
          {isEnabled ? (
            <Check className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={onToggle}
          disabled={isUpdating}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  );
}

interface PermissionCategoryProps {
  categoryKey: string;
  category: {
    label: string;
    permissions: Record<string, { label: string; description: string }>;
  };
  role: AppRole;
  effectivePermissions: PermissionKey[];
  isPermissionOverridden: (role: AppRole, permission: PermissionKey) => boolean;
  onToggle: (permission: PermissionKey, value: boolean) => void;
  onReset: (permission: PermissionKey) => void;
  isUpdating: boolean;
}

function PermissionCategory({
  categoryKey,
  category,
  role,
  effectivePermissions,
  isPermissionOverridden,
  onToggle,
  onReset,
  isUpdating,
}: PermissionCategoryProps) {
  const permissionEntries = Object.entries(category.permissions);
  const enabledCount = permissionEntries.filter(([key]) => 
    effectivePermissions.includes(key as PermissionKey)
  ).length;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 py-1.5">
        <h4 className="text-sm font-semibold text-foreground">{category.label}</h4>
        <Badge variant="secondary" className="text-xs">
          {enabledCount}/{permissionEntries.length}
        </Badge>
      </div>
      <div className="border rounded-lg divide-y">
        {permissionEntries.map(([key, config]) => {
          const permissionKey = key as PermissionKey;
          const isEnabled = effectivePermissions.includes(permissionKey);
          const isDefault = DEFAULT_ROLE_PERMISSIONS[role]?.includes(permissionKey) ?? false;
          const isOverridden = isPermissionOverridden(role, permissionKey);

          return (
            <PermissionToggle
              key={key}
              role={role}
              permissionKey={permissionKey}
              label={config.label}
              description={config.description}
              isEnabled={isEnabled}
              isDefault={isDefault}
              isOverridden={isOverridden}
              isUpdating={isUpdating}
              onToggle={(value) => onToggle(permissionKey, value)}
              onReset={() => onReset(permissionKey)}
            />
          );
        })}
      </div>
    </div>
  );
}

function RoleAccordionItem({ role }: { role: AppRole }) {
  const {
    getEffectivePermissions,
    isPermissionOverridden,
    setPermission,
    resetToDefaults,
  } = useRolePermissions();

  const [isUpdating, setIsUpdating] = useState(false);
  const effectivePermissions = getEffectivePermissions(role);
  const metadata = ROLE_METADATA[role];
  
  // Count overrides for this role
  const overrideCount = Object.values(PERMISSION_CATEGORIES)
    .flatMap(cat => Object.keys(cat.permissions))
    .filter(key => isPermissionOverridden(role, key as PermissionKey))
    .length;

  const handleToggle = async (permission: PermissionKey, value: boolean) => {
    setIsUpdating(true);
    try {
      await setPermission.mutateAsync({ role, permission, value });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async (permission: PermissionKey) => {
    setIsUpdating(true);
    try {
      await setPermission.mutateAsync({ role, permission, value: null });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetAll = async () => {
    setIsUpdating(true);
    try {
      await resetToDefaults.mutateAsync(role);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AccordionItem value={role} className="border rounded-lg px-1 mb-3 data-[state=open]:bg-muted/30">
      <AccordionTrigger className="hover:no-underline px-3 py-4">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">{metadata.label}</span>
              {overrideCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {overrideCount} override{overrideCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground text-left">
              {metadata.description}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {effectivePermissions.length} permissions
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-4 pt-2">
        <div className="space-y-6">
          {/* Reset all button */}
          {overrideCount > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAll}
                disabled={isUpdating}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Reset All to Defaults
              </Button>
            </div>
          )}

          {/* Module Access */}
          <PermissionCategory
            categoryKey="modules"
            category={PERMISSION_CATEGORIES.modules}
            role={role}
            effectivePermissions={effectivePermissions}
            isPermissionOverridden={isPermissionOverridden}
            onToggle={handleToggle}
            onReset={handleReset}
            isUpdating={isUpdating}
          />

          {/* Settings Access */}
          <PermissionCategory
            categoryKey="settings"
            category={PERMISSION_CATEGORIES.settings}
            role={role}
            effectivePermissions={effectivePermissions}
            isPermissionOverridden={isPermissionOverridden}
            onToggle={handleToggle}
            onReset={handleReset}
            isUpdating={isUpdating}
          />

          {/* Filter Access */}
          <PermissionCategory
            categoryKey="filters"
            category={PERMISSION_CATEGORIES.filters}
            role={role}
            effectivePermissions={effectivePermissions}
            isPermissionOverridden={isPermissionOverridden}
            onToggle={handleToggle}
            onReset={handleReset}
            isUpdating={isUpdating}
          />

          {/* Sub-filter Access */}
          <PermissionCategory
            categoryKey="subfilters"
            category={PERMISSION_CATEGORIES.subfilters}
            role={role}
            effectivePermissions={effectivePermissions}
            isPermissionOverridden={isPermissionOverridden}
            onToggle={handleToggle}
            onReset={handleReset}
            isUpdating={isUpdating}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function RolesManagement() {
  const { manageableRoles, isLoading } = useRolePermissions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Role Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Configure permissions for each role. Changes are applied immediately and affect all users with that role.
        </p>
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">
            Permissions marked with <Badge variant="outline" className="text-xs mx-1">Override</Badge> 
            differ from the default settings for that role.
          </span>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {manageableRoles.map((role) => (
          <RoleAccordionItem key={role} role={role} />
        ))}
      </Accordion>
    </div>
  );
}
