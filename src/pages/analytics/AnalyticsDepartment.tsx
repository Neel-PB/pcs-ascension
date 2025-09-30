import { motion } from "framer-motion";
import { TabNavigation, moduleTabConfigs } from "@/components/shell/TabNavigation";
import { ContentCard } from "@/components/shell/ContentCard";
import { Layers, TrendingUp, Users, Activity } from "lucide-react";

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

export default function AnalyticsDepartment() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Department Analytics</h1>
        <p className="text-shell-muted">Department-level workforce insights and efficiency metrics</p>
      </div>

      <TabNavigation tabs={moduleTabConfigs.analytics} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Layers}
          label="Total Departments"
          value="2,847"
          change="+42 from last quarter"
        />
        <StatsCard
          icon={Users}
          label="Avg Staff per Dept"
          value="24"
          change="+2.1% from last month"
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg Fill Rate"
          value="91.5%"
          change="+1.3% from last month"
        />
        <StatsCard
          icon={Activity}
          label="Performance Score"
          value="8.3/10"
          change="+0.2 from last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard title="Department Performance" className="p-6">
          <div className="space-y-4">
            {[
              { department: "Emergency Department", performance: 96, trend: "up" },
              { department: "Intensive Care Unit", performance: 94, trend: "up" },
              { department: "Medical-Surgical", performance: 89, trend: "stable" },
              { department: "Radiology", performance: 86, trend: "down" },
            ].map((item) => (
              <div key={item.department} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">{item.department}</span>
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

        <ContentCard title="Top Performing Departments" className="p-6">
          <div className="space-y-4">
            {[
              { department: "Emergency Department", positions: 48, fillRate: "96.3%", grade: "A+" },
              { department: "Intensive Care Unit", positions: 56, fillRate: "94.1%", grade: "A" },
              { department: "Medical-Surgical", positions: 72, fillRate: "89.7%", grade: "B+" },
              { department: "Radiology", positions: 32, fillRate: "86.2%", grade: "B" },
            ].map((item) => (
              <div key={item.department} className="flex items-center justify-between p-3 bg-shell-elevated rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{item.department}</p>
                  <p className="text-sm text-shell-muted">{item.positions} positions</p>
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
