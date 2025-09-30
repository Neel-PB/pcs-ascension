import { motion } from "framer-motion";
import { TabNavigation, moduleTabConfigs } from "@/components/shell/TabNavigation";
import { ContentCard } from "@/components/shell/ContentCard";
import { Building, TrendingUp, Users, Activity } from "lucide-react";

const StatsCard = ({ icon: Icon, label, value, change }: any) => (
  <div className="bg-shell-elevated rounded-xl p-6 shadow-soft">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-shell-muted mb-1">{label}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-green-600 dark:text-green-400 mt-2">{change}</p>
      </div>
      <div className="p-3 bg-primary/10 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </div>
);

export default function AnalyticsFacility() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Facility Analytics</h1>
        <p className="text-shell-muted">Facility-level workforce insights and operational metrics</p>
      </div>

      <TabNavigation tabs={moduleTabConfigs.analytics} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Building}
          label="Total Facilities"
          value="342"
          change="+8 from last quarter"
        />
        <StatsCard
          icon={Users}
          label="Avg Staff per Facility"
          value="156"
          change="+3.2% from last month"
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg Fill Rate"
          value="93.2%"
          change="+1.8% from last month"
        />
        <StatsCard
          icon={Activity}
          label="Performance Score"
          value="8.5/10"
          change="+0.4 from last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard title="Facility Performance" className="p-6">
          <div className="space-y-4">
            {[
              { facility: "Memorial Hospital - Chicago", performance: 97, trend: "up" },
              { facility: "Regional Medical Center - Dallas", performance: 95, trend: "up" },
              { facility: "Community Hospital - Houston", performance: 91, trend: "stable" },
              { facility: "Metro Health - Phoenix", performance: 88, trend: "down" },
            ].map((item) => (
              <div key={item.facility} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">{item.facility}</span>
                  <span className="text-shell-muted">{item.performance}%</span>
                </div>
                <div className="w-full bg-shell-muted/30 rounded-full h-2">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.performance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ContentCard>

        <ContentCard title="Top Performing Facilities" className="p-6">
          <div className="space-y-4">
            {[
              { facility: "Memorial Hospital - Chicago", departments: 18, fillRate: "97.1%", grade: "A+" },
              { facility: "Regional Medical Center - Dallas", departments: 22, fillRate: "95.3%", grade: "A" },
              { facility: "Community Hospital - Houston", departments: 15, fillRate: "91.6%", grade: "A-" },
              { facility: "Metro Health - Phoenix", departments: 12, fillRate: "88.4%", grade: "B+" },
            ].map((item) => (
              <div key={item.facility} className="flex items-center justify-between p-3 bg-shell-elevated rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{item.facility}</p>
                  <p className="text-sm text-shell-muted">{item.departments} departments</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{item.fillRate}</p>
                  <p className="text-sm text-primary">{item.grade}</p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>
    </motion.div>
  );
}
