import { useState } from "react";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";
import { ContentCard } from "@/components/shell/ContentCard";
import { FileText, Download, Calendar, TrendingUp } from "@/lib/icons";
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
  const [activeTab, setActiveTab] = useState("region");

  const tabs = [
    { id: "region", label: "Region" },
    { id: "market", label: "Market" },
    { id: "facility", label: "Facility" },
    { id: "department", label: "Department" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-center">
        <ToggleButtonGroup
          items={tabs}
          activeId={activeTab}
          onSelect={setActiveTab}
          layoutId="reportsToggle"
        />
      </div>

      <div className="space-y-6">
        {activeTab === "region" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReportCard icon={FileText} title="Regional Staffing Overview" description="Comprehensive staffing metrics across all regions" lastUpdated="Today, 8:00 AM" />
              <ReportCard icon={TrendingUp} title="Regional Performance Trends" description="Historical performance data and trend analysis" lastUpdated="Yesterday, 5:30 PM" />
              <ReportCard icon={FileText} title="Regional Variance Report" description="Budget vs actual staffing variance by region" lastUpdated="Today, 6:45 AM" />
              <ReportCard icon={FileText} title="Regional Compliance Report" description="Compliance metrics and certification status" lastUpdated="2 days ago" />
              <ReportCard icon={TrendingUp} title="Regional Turnover Analysis" description="Employee retention and turnover statistics" lastUpdated="Yesterday, 11:20 AM" />
              <ReportCard icon={FileText} title="Regional Cost Analysis" description="Labor cost breakdown and budget utilization" lastUpdated="Today, 7:15 AM" />
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
          </div>
        )}

        {activeTab === "market" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReportCard icon={FileText} title="Market Staffing Overview" description="Staffing levels and fill rates by market" lastUpdated="Today, 8:30 AM" />
              <ReportCard icon={TrendingUp} title="Market Growth Analysis" description="Market expansion and growth metrics" lastUpdated="Yesterday, 4:15 PM" />
              <ReportCard icon={FileText} title="Market Efficiency Report" description="Operational efficiency across markets" lastUpdated="Today, 7:00 AM" />
              <ReportCard icon={FileText} title="Market Benchmark Report" description="Market performance vs industry benchmarks" lastUpdated="3 days ago" />
              <ReportCard icon={TrendingUp} title="Market Revenue Impact" description="Staffing impact on market revenue" lastUpdated="Yesterday, 2:30 PM" />
              <ReportCard icon={FileText} title="Market Forecast Report" description="Future staffing needs by market" lastUpdated="Today, 6:00 AM" />
            </div>

            <ContentCard title="Market Highlights" className="p-6">
              <div className="space-y-4">
                {[
                  { market: "Greater Chicago", metric: "Fill Rate: 96.2%", status: "Exceeding Target" },
                  { market: "Dallas-Fort Worth", metric: "Fill Rate: 94.8%", status: "On Target" },
                  { market: "Greater Houston", metric: "Fill Rate: 92.4%", status: "On Target" },
                  { market: "Phoenix Metro", metric: "Fill Rate: 89.1%", status: "Below Target" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-shell-elevated rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.market}</p>
                      <p className="text-sm text-shell-muted">{item.metric}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === "Exceeding Target" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      item.status === "On Target" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        )}

        {activeTab === "facility" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReportCard icon={FileText} title="Facility Staffing Summary" description="Current staffing levels by facility" lastUpdated="Today, 9:00 AM" />
              <ReportCard icon={TrendingUp} title="Facility Performance Score" description="Operational performance metrics" lastUpdated="Yesterday, 3:45 PM" />
              <ReportCard icon={FileText} title="Facility Budget Report" description="Labor budget vs actual by facility" lastUpdated="Today, 6:30 AM" />
              <ReportCard icon={FileText} title="Facility Quality Metrics" description="Patient care and quality indicators" lastUpdated="2 days ago" />
              <ReportCard icon={TrendingUp} title="Facility Productivity" description="Staff productivity and utilization" lastUpdated="Yesterday, 1:15 PM" />
              <ReportCard icon={FileText} title="Facility Staffing Gaps" description="Open positions and vacancy analysis" lastUpdated="Today, 7:45 AM" />
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
          </div>
        )}

        {activeTab === "department" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReportCard icon={FileText} title="Department Roster Report" description="Complete staff roster by department" lastUpdated="Today, 9:30 AM" />
              <ReportCard icon={TrendingUp} title="Department Productivity" description="Efficiency and output metrics" lastUpdated="Yesterday, 5:00 PM" />
              <ReportCard icon={FileText} title="Department Scheduling" description="Schedule coverage and patterns" lastUpdated="Today, 8:15 AM" />
              <ReportCard icon={FileText} title="Department Overtime" description="Overtime hours and cost analysis" lastUpdated="Yesterday, 11:30 AM" />
              <ReportCard icon={TrendingUp} title="Department Skills Gap" description="Skills inventory and gap analysis" lastUpdated="3 days ago" />
              <ReportCard icon={FileText} title="Department Certifications" description="Staff certification status and renewals" lastUpdated="Today, 7:00 AM" />
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
          </div>
        )}
      </div>
    </div>
  );
}
