import { motion } from "framer-motion";
import { BarChart3, TrendingUp, MapPin, Users } from "lucide-react";
import { ContentCard, StatsCard } from "@/components/shell/ContentCard";
import { TabNavigation, moduleTabConfigs } from "@/components/shell/TabNavigation";

export default function AnalyticsRegion() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gradient">Regional Analytics</h1>
          <p className="text-shell-muted">
            Comprehensive workforce analytics across all regions and facilities.
          </p>
        </div>
        
        <TabNavigation tabs={moduleTabConfigs.analytics} />
      </motion.div>

      {/* Regional Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Regions"
          value="12"
          change={{ value: "+1 this quarter", type: "increase" }}
          icon={MapPin}
          delay={0.1}
        />
        <StatsCard
          title="Total Staff"
          value="4,892"
          change={{ value: "+127 this month", type: "increase" }}
          icon={Users}
          delay={0.2}
        />
        <StatsCard
          title="Avg Fill Rate"
          value="91.3%"
          change={{ value: "+2.4% this quarter", type: "increase" }}
          icon={TrendingUp}
          delay={0.3}
        />
        <StatsCard
          title="Performance Score"
          value="87.5"
          change={{ value: "+3.2 this month", type: "increase" }}
          icon={BarChart3}
          delay={0.4}
        />
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Regional Performance */}
        <ContentCard
          title="Regional Performance"
          icon={BarChart3}
          delay={0.5}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Northeast</span>
                <span className="text-sm text-muted-foreground">94.2%</span>
              </div>
              <div className="w-full bg-shell-elevated rounded-full h-2">
                <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "94.2%" }}></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Southwest</span>
                <span className="text-sm text-muted-foreground">89.7%</span>
              </div>
              <div className="w-full bg-shell-elevated rounded-full h-2">
                <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "89.7%" }}></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Midwest</span>
                <span className="text-sm text-muted-foreground">92.1%</span>
              </div>
              <div className="w-full bg-shell-elevated rounded-full h-2">
                <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "92.1%" }}></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Southeast</span>
                <span className="text-sm text-muted-foreground">88.3%</span>
              </div>
              <div className="w-full bg-shell-elevated rounded-full h-2">
                <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "88.3%" }}></div>
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Top Performing Facilities */}
        <ContentCard
          title="Top Performing Facilities"
          icon={TrendingUp}
          delay={0.6}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
              <div>
                <p className="text-sm font-medium">Metro General Hospital</p>
                <p className="text-xs text-muted-foreground">Northeast • 98.5% Fill Rate</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-success">A+</p>
                <p className="text-xs text-muted-foreground">Grade</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div>
                <p className="text-sm font-medium">Regional Medical Center</p>
                <p className="text-xs text-muted-foreground">Midwest • 96.2% Fill Rate</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">A</p>
                <p className="text-xs text-muted-foreground">Grade</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-shell-elevated">
              <div>
                <p className="text-sm font-medium">City Healthcare Network</p>
                <p className="text-xs text-muted-foreground">Southwest • 94.8% Fill Rate</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">A-</p>
                <p className="text-xs text-muted-foreground">Grade</p>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}