import { useState } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { MapPin, TrendingUp, Users, Activity, Building2, Building, Layers, BarChart3, LineChart, PieChart } from "lucide-react";
import { LookerReportHeader } from "@/components/analytics/LookerReportHeader";
import { LookerMetricCard } from "@/components/analytics/LookerMetricCard";
import { LookerChartCard } from "@/components/analytics/LookerChartCard";
import { LookerDataTable } from "@/components/analytics/LookerDataTable";
import { LookerChartPlaceholder } from "@/components/analytics/LookerChartPlaceholder";

export default function AnalyticsRegion() {
  const [activeTab, setActiveTab] = useState("region");

  const tabs = [
    { id: "region", label: "Region" },
    { id: "market", label: "Market" },
    { id: "facility", label: "Facility" },
    { id: "department", label: "Department" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <LayoutGroup>
        <div className="relative bg-secondary rounded-lg p-1 mb-6">
          <div className="flex">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                className={`relative flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors z-10 ${
                  activeTab === tab.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ flex: 1 }}
              >
                {tab.label}
              </motion.button>
            ))}
            
            <motion.div
              layoutId="analyticsTabIndicator"
              className="absolute inset-y-1 bg-primary rounded-sm"
              style={{
                left: `${(tabs.findIndex((t) => t.id === activeTab) / tabs.length) * 100}%`,
                width: `${100 / tabs.length}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
          </div>
        </div>
      </LayoutGroup>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6 animate-fade-in"
        >
          {activeTab === "region" && (
            <div className="space-y-6">
              <LookerReportHeader 
                title="Regional Performance Dashboard" 
                description="Comprehensive regional analytics and performance metrics"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <LookerMetricCard icon={MapPin} label="Total Regions" value="12" change="+8.3% vs last quarter" />
                <LookerMetricCard icon={Users} label="Total Staff" value="4,892" change="+5.2% vs last month" />
                <LookerMetricCard icon={TrendingUp} label="Fill Rate" value="91.3%" change="+2.4% vs last quarter" />
                <LookerMetricCard icon={Activity} label="Performance Score" value="87.5" change="+3.2 pts vs last month" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LookerChartCard title="Regional Performance Comparison" subtitle="Fill rate by region">
                  <LookerChartPlaceholder icon={BarChart3} />
                </LookerChartCard>

                <LookerChartCard title="Staff Trends Over Time" subtitle="Last 6 months">
                  <LookerChartPlaceholder icon={LineChart} gradientFrom="from-green-50 dark:from-green-950/30" gradientTo="to-teal-50 dark:to-teal-950/30" />
                </LookerChartCard>

                <LookerChartCard title="Staff Distribution by Region" subtitle="Current allocation">
                  <LookerChartPlaceholder icon={PieChart} gradientFrom="from-purple-50 dark:from-purple-950/30" gradientTo="to-pink-50 dark:to-pink-950/30" />
                </LookerChartCard>

                <LookerChartCard title="Regional Details" subtitle="Performance summary">
                  <LookerDataTable 
                    columns={[
                      { key: "region", label: "Region" },
                      { key: "facilities", label: "Facilities", align: "center" },
                      { key: "staff", label: "Staff", align: "right" },
                      { key: "fillRate", label: "Fill Rate", align: "right" },
                    ]}
                    data={[
                      { region: "Northeast", facilities: "87", staff: "1,342", fillRate: "94.2%" },
                      { region: "Southwest", facilities: "92", staff: "1,456", fillRate: "90.8%" },
                      { region: "Midwest", facilities: "78", staff: "1,189", fillRate: "92.5%" },
                      { region: "Southeast", facilities: "85", staff: "1,205", fillRate: "88.7%" },
                    ]}
                  />
                </LookerChartCard>
              </div>
            </div>
          )}

          {activeTab === "market" && (
            <div className="space-y-6">
              <LookerReportHeader 
                title="Market Analytics Dashboard" 
                description="Market-level performance insights and trends"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <LookerMetricCard icon={Building2} label="Total Markets" value="47" change="+6.4% vs last quarter" />
                <LookerMetricCard icon={Users} label="Total Staff" value="18,542" change="+5.2% vs last month" />
                <LookerMetricCard icon={TrendingUp} label="Fill Rate" value="94.8%" change="+2.1% vs last month" />
                <LookerMetricCard icon={Activity} label="Growth Rate" value="8.7%" change="+0.3% vs last month" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LookerChartCard title="Market Performance" subtitle="Top performing markets">
                  <LookerChartPlaceholder icon={BarChart3} />
                </LookerChartCard>

                <LookerChartCard title="Fill Rate Trends" subtitle="6-month trend analysis">
                  <LookerChartPlaceholder icon={LineChart} gradientFrom="from-orange-50 dark:from-orange-950/30" gradientTo="to-red-50 dark:to-red-950/30" />
                </LookerChartCard>

                <LookerChartCard title="Staff by Employment Type" subtitle="Full-time vs Contract">
                  <LookerChartPlaceholder icon={BarChart3} height="h-64" gradientFrom="from-indigo-50 dark:from-indigo-950/30" gradientTo="to-blue-50 dark:to-blue-950/30" />
                </LookerChartCard>

                <LookerChartCard title="Market Details" subtitle="Performance breakdown">
                  <LookerDataTable 
                    columns={[
                      { key: "market", label: "Market" },
                      { key: "facilities", label: "Facilities", align: "center" },
                      { key: "staff", label: "Staff", align: "right" },
                      { key: "fillRate", label: "Fill Rate", align: "right" },
                    ]}
                    data={[
                      { market: "Greater Chicago", facilities: "12", staff: "2,847", fillRate: "96.2%" },
                      { market: "Dallas-Fort Worth", facilities: "15", staff: "3,124", fillRate: "94.8%" },
                      { market: "Greater Houston", facilities: "10", staff: "2,456", fillRate: "92.4%" },
                      { market: "Phoenix Metro", facilities: "8", staff: "1,892", fillRate: "89.1%" },
                    ]}
                  />
                </LookerChartCard>
              </div>
            </div>
          )}

          {activeTab === "facility" && (
            <div className="space-y-6">
              <LookerReportHeader 
                title="Facility Operations Dashboard" 
                description="Facility-level operational metrics and efficiency"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <LookerMetricCard icon={Building} label="Total Facilities" value="342" change="+2.3% vs last quarter" />
                <LookerMetricCard icon={Users} label="Avg Staff per Facility" value="156" change="+3.2% vs last month" />
                <LookerMetricCard icon={TrendingUp} label="Fill Rate" value="93.2%" change="+1.8% vs last month" />
                <LookerMetricCard icon={Activity} label="Efficiency Score" value="8.5/10" change="+0.4 pts vs last month" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LookerChartCard title="Top 10 Facilities by Performance" subtitle="Current quarter rankings">
                  <LookerChartPlaceholder icon={BarChart3} />
                </LookerChartCard>

                <LookerChartCard title="Fill Rate Trends" subtitle="Monthly progression">
                  <LookerChartPlaceholder icon={LineChart} gradientFrom="from-cyan-50 dark:from-cyan-950/30" gradientTo="to-blue-50 dark:to-blue-950/30" />
                </LookerChartCard>

                <LookerChartCard title="Facility Performance Matrix" subtitle="Efficiency vs Fill Rate">
                  <LookerChartPlaceholder icon={Activity} gradientFrom="from-rose-50 dark:from-rose-950/30" gradientTo="to-pink-50 dark:to-pink-950/30" />
                </LookerChartCard>

                <LookerChartCard title="Facility Details" subtitle="Operational summary">
                  <LookerDataTable 
                    columns={[
                      { key: "facility", label: "Facility" },
                      { key: "departments", label: "Depts", align: "center" },
                      { key: "staff", label: "Staff", align: "right" },
                      { key: "fillRate", label: "Fill Rate", align: "right" },
                    ]}
                    data={[
                      { facility: "Memorial - Chicago", departments: "18", staff: "287", fillRate: "97.1%" },
                      { facility: "Regional MC - Dallas", departments: "22", staff: "342", fillRate: "95.3%" },
                      { facility: "Community - Houston", departments: "15", staff: "234", fillRate: "91.6%" },
                      { facility: "Metro Health - Phoenix", departments: "12", staff: "198", fillRate: "88.4%" },
                    ]}
                  />
                </LookerChartCard>
              </div>
            </div>
          )}

          {activeTab === "department" && (
            <div className="space-y-6">
              <LookerReportHeader 
                title="Department Analytics Dashboard" 
                description="Department-level staffing and performance analysis"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <LookerMetricCard icon={Layers} label="Total Departments" value="2,847" change="+1.5% vs last quarter" />
                <LookerMetricCard icon={Users} label="Avg Staff per Dept" value="24" change="+2.1% vs last month" />
                <LookerMetricCard icon={TrendingUp} label="Fill Rate" value="91.5%" change="+1.3% vs last month" />
                <LookerMetricCard icon={Activity} label="Turnover Rate" value="8.3%" change="-0.2% vs last month" changeType="positive" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LookerChartCard title="Department Performance" subtitle="Fill rate by department type">
                  <LookerChartPlaceholder icon={BarChart3} />
                </LookerChartCard>

                <LookerChartCard title="Staffing Trends" subtitle="Department staffing over time">
                  <LookerChartPlaceholder icon={LineChart} gradientFrom="from-emerald-50 dark:from-emerald-950/30" gradientTo="to-green-50 dark:to-green-950/30" />
                </LookerChartCard>

                <LookerChartCard title="Staff Distribution by Type" subtitle="Department categories">
                  <LookerChartPlaceholder icon={PieChart} gradientFrom="from-violet-50 dark:from-violet-950/30" gradientTo="to-purple-50 dark:to-purple-950/30" />
                </LookerChartCard>

                <LookerChartCard title="Department Details" subtitle="Performance metrics">
                  <LookerDataTable 
                    columns={[
                      { key: "department", label: "Department" },
                      { key: "positions", label: "Positions", align: "center" },
                      { key: "staff", label: "Staff", align: "right" },
                      { key: "fillRate", label: "Fill Rate", align: "right" },
                    ]}
                    data={[
                      { department: "Emergency Department", positions: "48", staff: "46", fillRate: "96.3%" },
                      { department: "Intensive Care Unit", positions: "56", staff: "53", fillRate: "94.1%" },
                      { department: "Medical-Surgical", positions: "72", staff: "65", fillRate: "89.7%" },
                      { department: "Radiology", positions: "32", staff: "28", fillRate: "86.2%" },
                    ]}
                  />
                </LookerChartCard>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
