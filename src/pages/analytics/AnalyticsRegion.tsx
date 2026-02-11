import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
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
      <LayoutGroup>
        <div className="relative bg-background rounded-lg p-1 mb-6">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`relative flex items-center justify-center px-4 py-2 text-sm font-medium transition-all z-10 hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === tab.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.id)}
                style={{ flex: 1 }}
              >
                {tab.label}
              </button>
            ))}
            
            <motion.div
              layoutId="analyticsTabIndicator"
              className="absolute inset-y-1 bg-primary rounded-sm"
              style={{
                left: `${(tabs.findIndex((t) => t.id === activeTab) / tabs.length) * 100}%`,
                width: `${100 / tabs.length}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
          </div>
        </div>
      </LayoutGroup>

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
