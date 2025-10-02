import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
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
    <motion.div 
      className={cn(
        "group relative flex flex-col items-center py-3 px-2 rounded-full transition-all duration-300 cursor-pointer overflow-visible",
        "hover:bg-muted/30"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      {/* Combined active background + indicator overlay */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-highlight"
          className="pointer-events-none absolute inset-0 z-0 rounded-full bg-primary/8"
          transition={{
            type: "spring",
            stiffness: 450,
            damping: 28
          }}
        >
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary rounded-full shadow-sm" />
        </motion.div>
      )}

      <div 
        onClick={handleModuleClick}
        className="relative z-10 flex flex-col items-center gap-1.5 w-full"
      >
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300",
          isActive 
            ? "text-primary" 
            : "text-muted-foreground/70 group-hover:text-primary"
        )}>
          <module.icon className="w-6 h-6" />
        </div>
        
        <span className={cn(
          "text-[10px] font-medium tracking-wide transition-colors duration-300 text-center leading-tight",
          isActive 
            ? "text-primary" 
            : "text-muted-foreground/70 group-hover:text-foreground"
        )}>
          {module.label}
        </span>
      </div>

      {/* Sub-items tooltip on hover */}
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute left-full ml-3 top-0 w-48 bg-background/95 backdrop-blur-md border border-border/50 shadow-xl rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto"
      >
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
      </motion.div>
    </motion.div>
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
      <div className="fixed left-0 top-0 z-40 h-full w-24 border-r border-border/40 backdrop-blur-sm bg-background/95 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-0 z-40 h-full w-24 max-w-24 border-r border-border/40 backdrop-blur-sm bg-background/95">
      <div className="flex h-full flex-col">
        {/* Organization switcher */}
        <div className="flex items-center justify-center py-4 px-3 border-b border-border/40">
          <OrganizationSwitcher />
        </div>

        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <LayoutGroup>
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
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
}
