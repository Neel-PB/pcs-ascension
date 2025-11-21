import { NavLink, useLocation, useNavigate, matchPath } from "react-router-dom";
import { useCallback, forwardRef } from "react";
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
  index: number;
}

const ModuleItem = forwardRef<HTMLDivElement, ModuleItemProps>(
  ({ module, isActive, index }, ref) => {
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
        ref={ref}
        onClick={handleModuleClick}
          className={cn(
            "group flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-colors relative w-full cursor-pointer aspect-square",
            isActive
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
>
        {isActive && (
          <motion.div
            layoutId="dynamicSidebarIndicator"
            className="absolute inset-0 rounded-xl bg-primary"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <module.icon className="relative z-10 h-5 w-5 stroke-[1.5]" />
        <span className="relative z-10 text-[10px] font-medium leading-tight text-center">
          {module.label}
        </span>
      </motion.div>
    );
  }
);

ModuleItem.displayName = "ModuleItem";

export function DynamicIconOnlySidebar() {
  const { sidebarModules, isLoading } = useDynamicSidebar();
  const { roles, loading: rbacLoading, hasPermission } = useRBAC();
  const location = useLocation();

  // Determine which module is active based on current location
  const getActiveModule = useCallback(() => {
    return sidebarModules.find(module =>
      module.items.some(item => {
        if (!item.url) return false;
        // Special handling for root path - must match exactly
        if (item.url === "/") {
          return matchPath({ path: "/", end: true }, location.pathname) !== null;
        }
        // For other paths, allow sub-routes
        return matchPath({ path: item.url, end: false }, location.pathname) !== null;
      })
    );
  }, [sidebarModules, location.pathname]);

  const activeModule = getActiveModule();

  if (isLoading || rbacLoading) {
    return (
      <div className="fixed left-0 top-0 z-50 h-screen border-r bg-background flex items-center justify-center" style={{ width: 'var(--sidebar-width)' }}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const accessibleModules = sidebarModules.filter(module => {
    return module.items.some(item => {
      if (!item.permissions || item.permissions.length === 0) return true;
      return item.permissions.some(permission => hasPermission(permission));
    });
  });

  return (
    <div className="fixed left-0 top-0 z-50 h-screen bg-background" style={{ width: 'var(--sidebar-width)' }}>
      <div className="flex h-full flex-col">
        {/* Organization switcher */}
        <div className="flex items-center justify-center py-3 px-2 border-r border-border">
          <OrganizationSwitcher />
        </div>

        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto pt-0 pb-4 border-r border-border">
          <LayoutGroup>
            <div className="relative bg-secondary/30 rounded-xl p-1 space-y-1 mx-1">
              {accessibleModules.map((module, index) => {
                const isActive = activeModule?.label === module.label;
                return (
                  <div
                    key={module.label}
                    className="relative"
                  >
                    <ModuleItem
                      module={module}
                      isActive={isActive}
                      index={index}
                    />
                  </div>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
}
