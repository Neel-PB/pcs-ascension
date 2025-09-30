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

export default function ReportsFacility() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Facility Reports</h1>
        <p className="text-shell-muted">Facility-level operational reports and metrics</p>
      </div>

      <TabNavigation tabs={moduleTabConfigs.reports} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          icon={FileText}
          title="Facility Staffing Summary"
          description="Current staffing levels by facility"
          lastUpdated="Today, 9:00 AM"
        />
        <ReportCard
          icon={TrendingUp}
          title="Facility Performance Score"
          description="Operational performance metrics"
          lastUpdated="Yesterday, 3:45 PM"
        />
        <ReportCard
          icon={FileText}
          title="Facility Budget Report"
          description="Labor budget vs actual by facility"
          lastUpdated="Today, 6:30 AM"
        />
        <ReportCard
          icon={FileText}
          title="Facility Quality Metrics"
          description="Patient care and quality indicators"
          lastUpdated="2 days ago"
        />
        <ReportCard
          icon={TrendingUp}
          title="Facility Productivity"
          description="Staff productivity and utilization"
          lastUpdated="Yesterday, 1:15 PM"
        />
        <ReportCard
          icon={FileText}
          title="Facility Staffing Gaps"
          description="Open positions and vacancy analysis"
          lastUpdated="Today, 7:45 AM"
        />
      </div>

      <ContentCard title="Facility Performance Overview" className="p-6">
        <div className="space-y-4">
          {[
            { facility: "Memorial Hospital - Chicago", departments: 18, fillRate: "97.1%", status: "Excellent" },
            { facility: "Regional Medical Center - Dallas", departments: 22, fillRate: "95.3%", status: "Good" },
            { facility: "Community Hospital - Houston", departments: 15, fillRate: "91.6%", status: "Good" },
            { facility: "Metro Health - Phoenix", departments: 12, fillRate: "88.4%", status: "Needs Attention" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-shell-elevated rounded-lg">
              <div>
                <p className="font-medium text-foreground">{item.facility}</p>
                <p className="text-sm text-shell-muted">{item.departments} departments • Fill Rate: {item.fillRate}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.status === "Excellent" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                item.status === "Good" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </ContentCard>
    </motion.div>
  );
}
