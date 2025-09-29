import { motion } from "framer-motion";
import { Users, UserPlus, Clock, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { ContentCard, StatsCard } from "@/components/shell/ContentCard";
import { TabNavigation, moduleTabConfigs } from "@/components/shell/TabNavigation";

export default function StaffingSummary() {
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
          <h1 className="text-3xl font-bold text-gradient">Staffing Overview</h1>
          <p className="text-shell-muted">
            Monitor staffing levels, position planning, and workforce analytics.
          </p>
        </div>
        
        <TabNavigation tabs={moduleTabConfigs.staffing} />
      </motion.div>

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
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <div>
                <p className="text-sm font-medium text-green-900">Emergency Department</p>
                <p className="text-xs text-green-700">Fully Staffed • 98% Fill Rate</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div>
                <p className="text-sm font-medium text-yellow-900">ICU</p>
                <p className="text-xs text-yellow-700">3 Positions Open • 89% Fill Rate</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-shell-elevated">
              <div>
                <p className="text-sm font-medium">Surgery</p>
                <p className="text-xs text-shell-muted">1 Position Open • 95% Fill Rate</p>
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
                  <span className="text-shell-muted">Registered Nurses</span>
                  <span className="font-medium">12 positions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-shell-muted">Medical Assistants</span>
                  <span className="font-medium">6 positions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-shell-muted">Administrative</span>
                  <span className="font-medium">3 positions</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <h4 className="text-sm font-semibold mb-2 text-primary">Priority Positions</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-shell-muted">ICU Nurses (Night Shift)</span>
                  <span className="font-medium text-red-600">Critical</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-shell-muted">OR Technicians</span>
                  <span className="font-medium text-yellow-600">High</span>
                </div>
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}