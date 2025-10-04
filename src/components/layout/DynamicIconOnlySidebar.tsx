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

        {/* Sub-items tooltip on hover */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 bg-background border shadow-lg rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
          <div className="space-y-1">
            {module.items
              .filter(item => {
                if (!item.permissions || item.permissions.length === 0) return true;
                return item.permissions.some(permission => hasPermission(permission));
              })
              .map((item, idx) => (
                <NavLink
                  key={idx}
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
      <div className="fixed left-0 top-0 z-40 h-full w-14 border-r bg-background flex items-center justify-center">
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
    <div className="fixed left-0 top-0 z-40 h-full w-20 max-w-20 border-r bg-background shadow-sm">
      <div className="flex h-full flex-col">
        {/* Organization switcher */}
        <div className="flex items-center justify-center py-3 px-2 border-b">
          <OrganizationSwitcher />
        </div>

        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto pt-0 pb-4">
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
