import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";

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

  const handleTabClick = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (tab) navigate(tab.path);
  };

  return (
    <div className={cn("w-full flex justify-center", className)}>
      <ToggleButtonGroup
        items={tabs}
        activeId={activeTab?.id ?? tabs[0].id}
        onSelect={handleTabClick}
        layoutId="navToggle"
      />
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
