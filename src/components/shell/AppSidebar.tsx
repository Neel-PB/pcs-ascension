import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  UserCog,
  TrendingUp,
  FileBarChart,
  LifeBuoy,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";

interface SidebarItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { id: "home", title: "Home", url: "/", icon: Home },
  { id: "staffing", title: "Staffing", url: "/staffing", icon: Users },
  { id: "positions", title: "Positions", url: "/positions", icon: UserCog },
  { id: "analytics", title: "Analytics", url: "/analytics", icon: TrendingUp },
  { id: "reports", title: "Reports", url: "/reports", icon: FileBarChart },
  { id: "support", title: "Support", url: "/support", icon: LifeBuoy },
  { id: "admin", title: "Admin", url: "/admin", icon: ShieldCheck },
];

const sidebarVariants = {
  expanded: { width: 280 },
  collapsed: { width: 80 },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export function AppSidebar() {
  const { collapsed, toggle } = useSidebar();
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  return (
    <motion.div
      className="fixed left-0 top-0 z-40 flex h-screen flex-col bg-shell border-r border-shell-line shadow-soft"
      variants={sidebarVariants}
      animate={collapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-center border-b border-shell-line">
        <motion.div
          className="flex items-center gap-3"
          layout
          transition={{ duration: 0.3 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <div className="text-sm font-bold text-white">P</div>
          </div>
          {!collapsed && (
            <motion.span
              className="text-lg font-semibold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              Position Control
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.url);

            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{
                  delay: index * 0.1,
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                <NavLink
                  to={item.url}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                    "hover:bg-shell-elevated hover:shadow-soft",
                    active
                      ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary"
                      : "text-shell-muted hover:text-foreground"
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      className="absolute right-0 top-1/2 h-6 w-1 rounded-l-full bg-primary"
                      layoutId="activeIndicator"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}

                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      active ? "text-primary" : "text-shell-subtle"
                    )}
                  />

                  {!collapsed && (
                    <motion.span
                      className="truncate"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.title}
                    </motion.span>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-shell-line p-4">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-shell-muted transition-all duration-200 hover:bg-shell-elevated hover:text-foreground"
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </motion.div>
  );
}