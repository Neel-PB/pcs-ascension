import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useRBAC } from "@/hooks/useRBAC";
import { OrganizationSwitcher } from "@/components/layout/OrganizationSwitcher";
import { InboxBadge } from "@/components/inbox/InboxBadge";
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
    <div className={cn(
      "group relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 cursor-pointer",
      "hover:bg-primary/10 hover:shadow-sm",
      isActive ? "bg-primary/15 shadow-soft" : ""
    )}>
      <div 
        onClick={handleModuleClick}
        className="flex flex-col items-center space-y-1 w-full"
      >
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
          isActive 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
        )}>
          <module.icon className="w-4 h-4" />
        </div>
        
        <span className={cn(
          "text-xs font-light transition-all duration-200 text-center leading-tight",
          isActive 
            ? "text-primary font-medium" 
            : "text-muted-foreground group-hover:text-foreground"
        )}>
          {module.label}
        </span>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-l-full shadow-sm z-10" />
        )}
      </div>

      {/* Sub-items tooltip on hover */}
      <div className="absolute left-full ml-2 top-0 w-48 bg-background border shadow-lg rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="space-y-1">
          {module.items
            .filter(item => {
              if (!item.permissions || item.permissions.length === 0) return true;
              return item.permissions.some(permission => hasPermission(permission));
            })
            .map((item, index) => (
              <NavLink
                key={index}
                to={item.url || '#'}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {item.badge}
                  </Badge>
                )}
                {item.isNew && (
                  <Badge variant="default" className="text-xs px-1.5 py-0">
                    New
                  </Badge>
                )}
                {item.title === "Inbox" && <InboxBadge />}
              </NavLink>
            ))}
        </div>
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
      <div className="fixed left-0 top-0 z-40 h-full w-14 border-r bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-0 z-40 h-full w-14 border-r bg-gradient-card backdrop-blur-sm shadow-elegant">
      <div className="flex h-full flex-col">
        {/* Organization switcher */}
        <div className="flex items-center justify-center p-2 border-b">
          <OrganizationSwitcher />
        </div>

        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-2">
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
