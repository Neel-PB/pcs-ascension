import { motion } from "framer-motion";
import { Users, UserPlus, Clock, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { ContentCard, StatsCard } from "@/components/shell/ContentCard";
import { TabNavigation, moduleTabConfigs } from "@/components/shell/TabNavigation";
import { FilterBar } from "@/components/staffing/FilterBar";

export default function StaffingSummary() {
  return (
    <div className="space-y-6">
      {/* Filters and Navigation */}
      <div className="space-y-4">
        <FilterBar />
        <TabNavigation tabs={moduleTabConfigs.staffing} />
      </div>

      {/* Staffing Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Current Staff"
          value="1,156"
          change={{ value: "+12 this week", type: "increase" }}
          icon={Users}
          delay={0.1}
        />
        <StatsCard
          title="New Hires"
          value="23"
          change={{ value: "+4 this month", type: "increase" }}
          icon={UserPlus}
          delay={0.2}
        />
        <StatsCard
          title="Overtime Hours"
          value="2,847"
          change={{ value: "-156 vs last week", type: "decrease" }}
          icon={Clock}
          delay={0.3}
        />
        <StatsCard
          title="Efficiency Rate"
          value="94.2%"
          change={{ value: "+2.1% this month", type: "increase" }}
          icon={TrendingUp}
          delay={0.4}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Status */}
        <ContentCard
          title="Department Status"
          icon={CheckCircle}
          delay={0.5}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
              <div>
                <p className="text-sm font-medium">Emergency Department</p>
                <p className="text-xs text-muted-foreground">Fully Staffed • 98% Fill Rate</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div>
                <p className="text-sm font-medium">ICU</p>
                <p className="text-xs text-muted-foreground">3 Positions Open • 89% Fill Rate</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-warning" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-shell-elevated">
              <div>
                <p className="text-sm font-medium">Surgery</p>
                <p className="text-xs text-muted-foreground">1 Position Open • 95% Fill Rate</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Position Planning */}
        <ContentCard
          title="Position Planning"
          icon={TrendingUp}
          delay={0.6}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-shell-elevated">
              <h4 className="text-sm font-semibold mb-2">Q4 2024 Hiring Plan</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Registered Nurses</span>
                  <span className="font-medium">12 positions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Medical Assistants</span>
                  <span className="font-medium">6 positions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Administrative</span>
                  <span className="font-medium">3 positions</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <h4 className="text-sm font-semibold mb-2 text-primary">Priority Positions</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ICU Nurses (Night Shift)</span>
                  <span className="font-medium text-danger">Critical</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">OR Technicians</span>
                  <span className="font-medium text-warning">High</span>
                </div>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}