import { motion } from "framer-motion";
import { Users, UserCheck, AlertTriangle, TrendingUp, Calendar, Clock } from "lucide-react";
import { ContentCard, StatsCard } from "@/components/shell/ContentCard";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gradient">Position Control Dashboard</h1>
        <p className="text-shell-muted">
          Welcome back! Stay connected with your team and monitor your workforce network.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Positions"
          value="1,247"
          change={{ value: "+12 this week", type: "increase" }}
          icon={Users}
          delay={0.1}
        />
        <StatsCard
          title="Filled Positions"
          value="1,156"
          change={{ value: "+8 this week", type: "increase" }}
          icon={UserCheck}
          delay={0.2}
        />
        <StatsCard
          title="Open Requisitions"
          value="34"
          change={{ value: "-2 this week", type: "decrease" }}
          icon={AlertTriangle}
          delay={0.3}
        />
        <StatsCard
          title="Fill Rate"
          value="92.7%"
          change={{ value: "+1.2% this month", type: "increase" }}
          icon={TrendingUp}
          delay={0.4}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <ContentCard
          title="Recent Activity"
          icon={Clock}
          delay={0.5}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-shell-elevated transition-colors">
              <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Position Filled</p>
                <p className="text-xs text-shell-muted">
                  ICU Registered Nurse position has been successfully filled
                </p>
                <p className="text-xs text-shell-subtle">5 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-shell-elevated transition-colors">
              <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Overtime Alert</p>
                <p className="text-xs text-shell-muted">
                  Sarah Johnson is approaching 40-hour overtime limit
                </p>
                <p className="text-xs text-shell-subtle">15 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-shell-elevated transition-colors">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">New Requisition</p>
                <p className="text-xs text-shell-muted">
                  Emergency Department submitted request for 2 RN positions
                </p>
                <p className="text-xs text-shell-subtle">30 minutes ago</p>
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Upcoming Schedule */}
        <ContentCard
          title="Upcoming Schedule"
          icon={Calendar}
          delay={0.6}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-shell-elevated">
              <div>
                <p className="text-sm font-medium">Quarterly Staffing Review</p>
                <p className="text-xs text-shell-muted">Today at 2:00 PM</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-shell-elevated transition-colors">
              <div>
                <p className="text-sm font-medium">Weekend Coverage Planning</p>
                <p className="text-xs text-shell-muted">Tomorrow at 10:00 AM</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-shell-elevated transition-colors">
              <div>
                <p className="text-sm font-medium">Department Head Meeting</p>
                <p className="text-xs text-shell-muted">Friday at 3:00 PM</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}