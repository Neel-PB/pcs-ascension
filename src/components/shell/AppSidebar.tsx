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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { id: "home", title: "Dashboard", url: "/", icon: Home },
  { id: "staffing", title: "Position Planning & Staffing", url: "/staffing", icon: Users },
  { id: "positions", title: "Workforce Management", url: "/positions", icon: UserCog },
  { id: "analytics", title: "Multi-Site Analytics", url: "/analytics", icon: TrendingUp },
  { id: "reports", title: "Position Reports", url: "/reports", icon: FileBarChart },
  { id: "support", title: "Resources & Support", url: "/support", icon: LifeBuoy },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  return (
    <div className="fixed left-0 top-0 z-40 flex h-screen w-20 flex-col bg-shell border-r border-shell-line shadow-soft">
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-center border-b border-shell-line">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-sm">
          <span className="text-lg font-bold text-white">P</span>
        </div>
      </div>

      {/* Navigation Items */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 py-4">
          <div className="space-y-1 px-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.url);

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.url}
                      className={cn(
                        "group relative flex h-12 w-full items-center justify-center rounded-lg transition-all duration-200",
                        active
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-shell-muted hover:bg-shell-elevated hover:text-foreground"
                      )}
                    >
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-l-full bg-primary" />
                      )}

                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors",
                          active ? "text-primary" : "text-shell-subtle"
                        )}
                      />
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </nav>

        {/* Settings at bottom */}
        <div className="border-t border-shell-line py-4 px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to="/admin"
                className={cn(
                  "flex h-12 w-full items-center justify-center rounded-lg transition-all duration-200",
                  location.pathname.startsWith("/admin")
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-shell-muted hover:bg-shell-elevated hover:text-foreground"
                )}
              >
                <ShieldCheck className="h-5 w-5" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Admin
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}