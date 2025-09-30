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

export default function ReportsRegion() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Regional Reports</h1>
        <p className="text-shell-muted">Comprehensive regional workforce reports and analytics</p>
      </div>

      <TabNavigation tabs={moduleTabConfigs.reports} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          icon={FileText}
          title="Regional Staffing Overview"
          description="Comprehensive staffing metrics across all regions"
          lastUpdated="Today, 8:00 AM"
        />
        <ReportCard
          icon={TrendingUp}
          title="Regional Performance Trends"
          description="Historical performance data and trend analysis"
          lastUpdated="Yesterday, 5:30 PM"
        />
        <ReportCard
          icon={FileText}
          title="Regional Variance Report"
          description="Budget vs actual staffing variance by region"
          lastUpdated="Today, 6:45 AM"
        />
        <ReportCard
          icon={FileText}
          title="Regional Compliance Report"
          description="Compliance metrics and certification status"
          lastUpdated="2 days ago"
        />
        <ReportCard
          icon={TrendingUp}
          title="Regional Turnover Analysis"
          description="Employee retention and turnover statistics"
          lastUpdated="Yesterday, 11:20 AM"
        />
        <ReportCard
          icon={FileText}
          title="Regional Cost Analysis"
          description="Labor cost breakdown and budget utilization"
          lastUpdated="Today, 7:15 AM"
        />
      </div>

      <ContentCard title="Recent Activity" className="p-6">
        <div className="space-y-4">
          {[
            { user: "John Smith", action: "Generated Regional Staffing Overview", time: "2 hours ago" },
            { user: "Sarah Johnson", action: "Exported Regional Performance Trends", time: "4 hours ago" },
            { user: "Mike Davis", action: "Generated Regional Variance Report", time: "1 day ago" },
            { user: "Emily Brown", action: "Exported Regional Compliance Report", time: "2 days ago" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-shell-elevated rounded-lg">
              <div>
                <p className="font-medium text-foreground">{item.user}</p>
                <p className="text-sm text-shell-muted">{item.action}</p>
              </div>
              <p className="text-xs text-shell-muted">{item.time}</p>
            </div>
          ))}
        </div>
      </ContentCard>
    </motion.div>
  );
}
