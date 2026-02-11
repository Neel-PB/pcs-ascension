import { useState } from "react";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";
import { BarChart3 } from "@/lib/icons";
import { RegionVolumeTrendCharts } from "@/components/analytics/RegionVolumeTrendCharts";

export default function AnalyticsRegion() {
  const [activeTab, setActiveTab] = useState("region");

  const tabs = [
    { id: "region", label: "Region" },
    { id: "market", label: "Market" },
    { id: "facility", label: "Facility" },
    { id: "department", label: "Department" },
  ];

  const tabLabels: Record<string, string> = {
    region: "Region Analytics",
    market: "Market Analytics",
    facility: "Facility Analytics",
    department: "Department Analytics",
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <ToggleButtonGroup
          items={tabs}
          activeId={activeTab}
          onSelect={setActiveTab}
          layoutId="analyticsToggle"
        />
      </div>

      <div>
        {activeTab === "region" ? (
          <RegionVolumeTrendCharts />
        ) : (
          <div className="h-[400px] bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex flex-col items-center justify-center border border-border/50">
            <BarChart3 className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">{tabLabels[activeTab]}</h3>
            <p className="text-sm text-muted-foreground/60">Dashboard coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
