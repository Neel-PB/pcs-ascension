import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useRBAC } from "@/hooks/useRBAC";
import { OrganizationSwitcher } from "@/components/layout/OrganizationSwitcher";
import { InboxBadge } from "@/components/inbox/InboxBadge";
import { useDynamicSidebar, type DynamicMenuGroup } from "@/hooks/useDynamicSidebar";
import { GlassButton } from "@/components/ui/glass-button";

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
    <div className="relative group">
      <GlassButton
        size="icon"
        className={cn(
          "w-full h-auto",
          isActive && "active"
        )}
        contentClassName="flex flex-col items-center gap-1.5 py-3 px-2"
        onClick={handleModuleClick}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-highlight"
            className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full z-20"
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 30
            }}
          />
        )}

        <div className={cn(
          "flex items-center justify-center w-8 h-8 transition-all duration-200",
          isActive 
            ? "text-primary" 
            : "text-muted-foreground group-hover:text-primary"
        )}>
          <module.icon className="w-5 h-5" />
        </div>
        
        <span className={cn(
          "text-[10px] font-medium transition-all duration-200 text-center leading-tight",
          isActive 
            ? "text-primary" 
            : "text-muted-foreground group-hover:text-foreground"
        )}>
          {module.label}
        </span>
      </GlassButton>

      {/* Sub-items tooltip on hover */}
      <div className="absolute left-full ml-3 top-0 w-48 bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
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
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
      <div className="fixed left-0 top-0 z-40 h-full w-14 border-r bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-0 z-40 h-full w-20 max-w-20 border-r bg-background/80 backdrop-blur-sm shadow-sm">
      <div className="flex h-full flex-col">
        {/* Organization switcher */}
        <div className="flex items-center justify-center py-3 px-2 border-b">
          <OrganizationSwitcher />
        </div>

        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto py-1.5 px-2">
          <LayoutGroup>
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
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
}
