import { motion } from "framer-motion";
import { TabNavigation, moduleTabConfigs } from "@/components/shell/TabNavigation";
import { ContentCard } from "@/components/shell/ContentCard";
import { Building2, TrendingUp, Users, Activity } from "lucide-react";

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

export default function AnalyticsMarket() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Market Analytics</h1>
        <p className="text-shell-muted">Market-level workforce insights and performance metrics</p>
      </div>

      <TabNavigation tabs={moduleTabConfigs.analytics} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Building2}
          label="Total Markets"
          value="47"
          change="+3 from last quarter"
        />
        <StatsCard
          icon={Users}
          label="Total Staff"
          value="18,542"
          change="+5.2% from last month"
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg Fill Rate"
          value="94.8%"
          change="+2.1% from last month"
        />
        <StatsCard
          icon={Activity}
          label="Performance Score"
          value="8.7/10"
          change="+0.3 from last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard title="Market Performance" className="p-6">
          <div className="space-y-4">
            {[
              { market: "Greater Chicago", performance: 96, trend: "up" },
              { market: "Dallas-Fort Worth", performance: 94, trend: "up" },
              { market: "Greater Houston", performance: 92, trend: "stable" },
              { market: "Phoenix Metro", performance: 89, trend: "down" },
            ].map((item) => (
              <div key={item.market} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">{item.market}</span>
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

        <ContentCard title="Top Performing Markets" className="p-6">
          <div className="space-y-4">
            {[
              { market: "Greater Chicago", facilities: 12, fillRate: "96.2%", grade: "A+" },
              { market: "Dallas-Fort Worth", facilities: 15, fillRate: "94.8%", grade: "A" },
              { market: "Greater Houston", facilities: 10, fillRate: "92.4%", grade: "A-" },
              { market: "Phoenix Metro", facilities: 8, fillRate: "89.1%", grade: "B+" },
            ].map((item) => (
              <div key={item.market} className="flex items-center justify-between p-3 bg-shell-elevated rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{item.market}</p>
                  <p className="text-sm text-shell-muted">{item.facilities} facilities</p>
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
