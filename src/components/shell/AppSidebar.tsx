import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  UserCog,
  TrendingUp,
  FileBarChart,
  LifeBuoy,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import AscensionLogo from "@/assets/Ascension-Emblem.svg";

interface SidebarItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { id: "staffing", title: "Staffing", url: "/staffing", icon: Users },
  { id: "positions", title: "Positions", url: "/positions", icon: UserCog },
  { id: "analytics", title: "Analytics", url: "/analytics", icon: TrendingUp },
  { id: "reports", title: "Reports", url: "/reports", icon: FileBarChart },
  { id: "support", title: "Support", url: "/support", icon: LifeBuoy },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (url: string) => {
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
        <LayoutGroup>
          {/* Navigation Items */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {/* Main navigation items */}
            <div className="relative bg-secondary/30 rounded-xl p-1.5 space-y-1 mx-2">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.url);

                return (
                  <NavLink
                    key={item.id}
                    to={item.url}
                    className="relative block"
                  >
                    <motion.div
                      className={cn(
                        "relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-colors w-full",
                        active
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebarIndicator"
                          className="absolute inset-0 bg-primary rounded-lg"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                      <Icon className="relative z-10 h-5 w-5 stroke-[1.5]" />
                      <span className="relative z-10 text-[10px] font-medium leading-tight text-center">
                        {item.title}
                      </span>
                    </motion.div>
                  </NavLink>
                );
              })}

              {/* Separator */}
              <div className="my-2 border-t border-border/50" />

              {/* Admin Item */}
              <NavLink
                to="/admin"
                className="relative block"
              >
                <motion.div
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-colors w-full",
                    location.pathname.startsWith("/admin")
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {location.pathname.startsWith("/admin") && (
                    <motion.div
                      layoutId="sidebarIndicator"
                      className="absolute inset-0 bg-primary rounded-lg"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  <ShieldCheck className="relative z-10 h-5 w-5 stroke-[1.5]" />
                  <span className="relative z-10 text-[10px] font-medium leading-tight text-center">
                    Admin
                  </span>
                </motion.div>
              </NavLink>

              {/* Separator */}
              <div className="my-2 border-t border-border/50" />

              {/* Feedback Item */}
              <NavLink
                to="/feedback"
                className="relative block"
              >
                <motion.div
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-colors w-full",
                    location.pathname.startsWith("/feedback")
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {location.pathname.startsWith("/feedback") && (
                    <motion.div
                      layoutId="sidebarIndicator"
                      className="absolute inset-0 bg-primary rounded-lg"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  <MessageSquare className="relative z-10 h-5 w-5 stroke-[1.5]" />
                  <span className="relative z-10 text-[10px] font-medium leading-tight text-center">
                    Feedback
                  </span>
                </motion.div>
              </NavLink>
            </div>
          </nav>
        </LayoutGroup>
      </div>
    </>
  );
}