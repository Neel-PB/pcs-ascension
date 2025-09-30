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

export default function ReportsMarket() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Market Reports</h1>
        <p className="text-shell-muted">Market-level workforce reports and performance analytics</p>
      </div>

      <TabNavigation tabs={moduleTabConfigs.reports} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          icon={FileText}
          title="Market Staffing Overview"
          description="Staffing levels and fill rates by market"
          lastUpdated="Today, 8:30 AM"
        />
        <ReportCard
          icon={TrendingUp}
          title="Market Growth Analysis"
          description="Market expansion and growth metrics"
          lastUpdated="Yesterday, 4:15 PM"
        />
        <ReportCard
          icon={FileText}
          title="Market Efficiency Report"
          description="Operational efficiency across markets"
          lastUpdated="Today, 7:00 AM"
        />
        <ReportCard
          icon={FileText}
          title="Market Benchmark Report"
          description="Market performance vs industry benchmarks"
          lastUpdated="3 days ago"
        />
        <ReportCard
          icon={TrendingUp}
          title="Market Revenue Impact"
          description="Staffing impact on market revenue"
          lastUpdated="Yesterday, 2:30 PM"
        />
        <ReportCard
          icon={FileText}
          title="Market Forecast Report"
          description="Future staffing needs by market"
          lastUpdated="Today, 6:00 AM"
        />
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
    </motion.div>
  );
}
