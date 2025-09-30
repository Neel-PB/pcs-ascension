import { useLocation, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { useRBAC } from "@/hooks/useRBAC";
import { OrganizationSwitcher } from "@/components/layout/OrganizationSwitcher";
import { useDynamicSidebar, type DynamicMenuGroup } from "@/hooks/useDynamicSidebar";

interface ModuleItemProps {
  module: DynamicMenuGroup;
  isActive: boolean;
}

function ModuleItem({ module, isActive }: ModuleItemProps) {
  const { hasPermission } = useRBAC();
  const navigate = useNavigate();

  // Check if user has access to any sub-items
  const hasAccessibleItems = module.items.some(item => {
    if (!item.permissions || item.permissions.length === 0) return true;
    return item.permissions.some(permission => hasPermission(permission));
  });

  // Don't render if user has no access to any items
  if (!hasAccessibleItems) return null;

  // Handle module click - navigate to first accessible sub-item
  const handleModuleClick = useCallback(() => {
    const firstAccessibleItem = module.items.find(item => {
      if (!item.permissions || item.permissions.length === 0) return true;
      return item.permissions.some(permission => hasPermission(permission));
    });

    if (firstAccessibleItem?.url) {
      navigate(firstAccessibleItem.url);
    }
  }, [module.items, hasPermission, navigate]);

  return (
    <div 
      className={cn(
        "relative flex flex-col items-center py-3 px-3 rounded-xl transition-colors duration-200 cursor-pointer",
        isActive ? "bg-blue-100" : "hover:bg-muted/50"
      )}
      onClick={handleModuleClick}
    >
      <div className="flex flex-col items-center gap-2 w-full">
        <div className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200",
          isActive 
            ? "text-blue-600" 
            : "text-muted-foreground"
        )}>
          <module.icon className="w-6 h-6" />
        </div>
        
        <span className={cn(
          "text-xs font-medium text-center leading-tight",
          isActive 
            ? "text-blue-600" 
            : "text-muted-foreground"
        )}>
          {module.label}
        </span>
      </div>
    </div>
  );
}

export function DynamicIconOnlySidebar() {
  const { sidebarModules, isLoading } = useDynamicSidebar();
  const { roles, loading: rbacLoading } = useRBAC();
  const location = useLocation();

  // Determine which module is active based on current location
  const getActiveModule = useCallback(() => {
    return sidebarModules.find(module =>
      module.items.some(item => 
        item.url && (location.pathname === item.url || location.pathname.startsWith(item.url + '/'))
      )
    );
  }, [sidebarModules, location.pathname]);

  const activeModule = getActiveModule();

  if (isLoading || rbacLoading) {
    return (
      <div className="fixed left-0 top-0 z-40 h-full w-14 border-r bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-0 z-40 h-full w-32 max-w-32 border-r bg-background shadow-sm">
      <div className="flex h-full flex-col">
        {/* Organization switcher */}
        <div className="flex items-center justify-center py-4 px-3 border-b">
          <OrganizationSwitcher />
        </div>

        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto py-2 px-3">
          <div className="space-y-1">
            {sidebarModules.map((module) => {
              const isActive = activeModule?.label === module.label;
              return (
                <ModuleItem 
                  key={module.label} 
                  module={module} 
                  isActive={isActive}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
