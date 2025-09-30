import { motion } from "framer-motion";
import { TabNavigation, moduleTabConfigs } from "@/components/shell/TabNavigation";
import { ContentCard } from "@/components/shell/ContentCard";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReportCard = ({ title, description, lastUpdated, icon: Icon }: any) => (
  <div className="bg-shell-elevated rounded-xl p-6 shadow-soft">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-primary/10 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-shell-muted mb-4">{description}</p>
    <p className="text-xs text-shell-muted flex items-center">
      <Calendar className="h-3 w-3 mr-1" />
      Last updated: {lastUpdated}
    </p>
  </div>
);

export default function ReportsDepartment() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Department Reports</h1>
        <p className="text-shell-muted">Department-level staffing reports and efficiency metrics</p>
      </div>

      <TabNavigation tabs={moduleTabConfigs.reports} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          icon={FileText}
          title="Department Roster Report"
          description="Complete staff roster by department"
          lastUpdated="Today, 9:30 AM"
        />
        <ReportCard
          icon={TrendingUp}
          title="Department Productivity"
          description="Efficiency and output metrics"
          lastUpdated="Yesterday, 5:00 PM"
        />
        <ReportCard
          icon={FileText}
          title="Department Scheduling"
          description="Schedule coverage and patterns"
          lastUpdated="Today, 8:15 AM"
        />
        <ReportCard
          icon={FileText}
          title="Department Overtime"
          description="Overtime hours and cost analysis"
          lastUpdated="Yesterday, 11:30 AM"
        />
        <ReportCard
          icon={TrendingUp}
          title="Department Skills Gap"
          description="Skills inventory and gap analysis"
          lastUpdated="3 days ago"
        />
        <ReportCard
          icon={FileText}
          title="Department Certifications"
          description="Staff certification status and renewals"
          lastUpdated="Today, 7:00 AM"
        />
      </div>

      <ContentCard title="Department Insights" className="p-6">
        <div className="space-y-4">
          {[
            { department: "Emergency Department", positions: 48, fillRate: "96.3%", overtime: "12.5 hrs/week" },
            { department: "Intensive Care Unit", positions: 56, fillRate: "94.1%", overtime: "8.2 hrs/week" },
            { department: "Medical-Surgical", positions: 72, fillRate: "89.7%", overtime: "15.8 hrs/week" },
            { department: "Radiology", positions: 32, fillRate: "86.2%", overtime: "6.4 hrs/week" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-shell-elevated rounded-lg">
              <div>
                <p className="font-medium text-foreground">{item.department}</p>
                <p className="text-sm text-shell-muted">{item.positions} positions • Fill Rate: {item.fillRate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-shell-muted">Avg Overtime</p>
                <p className="text-sm font-semibold text-foreground">{item.overtime}</p>
              </div>
            </div>
          ))}
        </div>
      </ContentCard>
    </motion.div>
  );
}
