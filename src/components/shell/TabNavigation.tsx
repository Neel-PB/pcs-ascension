import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Tab {
  readonly id: string;
  readonly label: string;
  readonly path: string;
}

interface TabNavigationProps {
  tabs: readonly Tab[];
  className?: string;
}

export function TabNavigation({ tabs, className }: TabNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = tabs.find((tab) => location.pathname === tab.path) || tabs[0];

  const handleTabClick = (tab: Tab) => {
    navigate(tab.path);
  };

  return (
    <div className={cn("w-full", className)}>
      <LayoutGroup>
        <div className="flex items-center gap-4 border-b border-border">
          {tabs.map((tab) => {
            const isActive = activeTab?.id === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={cn(
                  "relative pb-2.5 pt-1 text-sm transition-colors whitespace-nowrap",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

// Pre-defined tab configurations for each module
export const moduleTabConfigs = {
  staffing: [
    { id: "summary", label: "Summary", path: "/staffing" },
    { id: "planning", label: "Position Planning", path: "/staffing/planning" },
    { id: "variance", label: "Variance Analysis", path: "/staffing/variance" },
    { id: "forecasts", label: "Forecasts", path: "/staffing/forecasts" },
    { id: "volume-settings", label: "Volume Settings", path: "/staffing/volume-settings" },
    { id: "np-settings", label: "NP Settings", path: "/staffing/np-settings" },
  ],
  positions: [
    { id: "employees", label: "Employees", path: "/positions" },
    { id: "contractors", label: "Contractors", path: "/positions/contractors" },
    { id: "requisitions", label: "Requisitions", path: "/positions/requisitions" },
    { id: "flex", label: "FLEX Positions", path: "/positions/flex" },
  ],
  analytics: [
    { id: "region", label: "Region", path: "/analytics" },
    { id: "market", label: "Market", path: "/analytics/market" },
    { id: "facility", label: "Facility", path: "/analytics/facility" },
    { id: "department", label: "Department", path: "/analytics/department" },
  ],
  support: [
    { id: "faq", label: "FAQ", path: "/support" },
    { id: "tickets", label: "Service Tickets", path: "/support/tickets" },
    { id: "resources", label: "Resources", path: "/support/resources" },
  ],
  reports: [
    { id: "region", label: "Region", path: "/reports" },
    { id: "market", label: "Market", path: "/reports/market" },
    { id: "facility", label: "Facility", path: "/reports/facility" },
    { id: "department", label: "Department", path: "/reports/department" },
  ],
  admin: [
    { id: "users", label: "User Management", path: "/admin" },
    { id: "roles", label: "Roles", path: "/admin/roles" },
    { id: "permissions", label: "Permissions", path: "/admin/permissions" },
    { id: "integrations", label: "Integrations", path: "/admin/integrations" },
    { id: "security", label: "Security", path: "/admin/security" },
  ],
} as const;
