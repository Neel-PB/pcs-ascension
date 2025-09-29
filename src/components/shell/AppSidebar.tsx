import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  UserCog,
  TrendingUp,
  FileBarChart,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import AscensionLogo from "@/assets/Ascension-Emblem.png";

interface SidebarItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { id: "home", title: "Home", url: "/", icon: Home },
  { id: "staffing", title: "Staffing", url: "/staffing", icon: Users },
  { id: "positions", title: "Workforce", url: "/positions", icon: UserCog },
  { id: "analytics", title: "Analytics", url: "/analytics", icon: TrendingUp },
  { id: "reports", title: "Reports", url: "/reports", icon: FileBarChart },
  { id: "support", title: "Support", url: "/support", icon: LifeBuoy },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  return (
    <>
      {/* Logo in intersection area */}
      <div className="fixed top-0 left-0 z-50 w-20 h-16 flex items-center justify-center bg-background border-r border-b border-border">
        <img src={AscensionLogo} alt="Ascension" className="w-10 h-10 object-contain" />
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-20 flex-col bg-background border-r border-border">
        {/* Navigation Items */}
        <nav className="flex-1 py-4">
          <div className="space-y-3 px-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.url);

              return (
                <NavLink
                  key={item.id}
                  to={item.url}
                  className="relative block"
                >
                  {/* Active indicator with framer-motion animation */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-r-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}

                  <div
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium leading-tight text-center">
                      {item.title}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Admin at bottom */}
        <div className="border-t border-border py-4 px-2">
          <NavLink
            to="/admin"
            className="relative block"
          >
            {location.pathname.startsWith("/admin") && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-r-full bg-primary"
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}

            <div
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-200",
                location.pathname.startsWith("/admin")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-medium leading-tight text-center">
                Admin
              </span>
            </div>
          </NavLink>
        </div>
      </div>
    </>
  );
}