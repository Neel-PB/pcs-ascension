import { motion } from "framer-motion";
import { ContentCard } from "@/components/shell/ContentCard";
import { MapPin, TrendingUp, Users, Activity, Building2, Building, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StatsCard = ({ icon: Icon, label, value, change }: any) => (
  <div className="bg-shell-elevated rounded-xl p-6 shadow-soft">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-shell-muted mb-1">{label}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-green-600 dark:text-green-400 mt-2">{change}</p>
      </div>
      <div className="p-3 bg-primary/10 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </div>
);

export default function AnalyticsRegion() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-shell-muted">Comprehensive workforce analytics across all levels</p>
      </div>

      <Tabs defaultValue="region" className="w-full">
        <div className="bg-shell-elevated rounded-xl p-2 shadow-soft mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1">
            <TabsTrigger value="region" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Region
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Market
            </TabsTrigger>
            <TabsTrigger value="facility" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Facility
            </TabsTrigger>
            <TabsTrigger value="department" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Department
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="region" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard icon={MapPin} label="Total Regions" value="12" change="+1 this quarter" />
            <StatsCard icon={Users} label="Total Staff" value="4,892" change="+127 this month" />
            <StatsCard icon={TrendingUp} label="Avg Fill Rate" value="91.3%" change="+2.4% this quarter" />
            <StatsCard icon={Activity} label="Performance Score" value="87.5" change="+3.2 this month" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentCard title="Regional Performance" className="p-6">
              <div className="space-y-4">
                {[
                  { region: "Northeast", performance: 94 },
                  { region: "Southwest", performance: 90 },
                  { region: "Midwest", performance: 92 },
                  { region: "Southeast", performance: 88 },
                ].map((item) => (
                  <div key={item.region} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{item.region}</span>
                      <span className="text-shell-muted">{item.performance}%</span>
                    </div>
                    <div className="w-full bg-shell-muted/30 rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full transition-all" style={{ width: `${item.performance}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>

            <ContentCard title="Top Performing Facilities" className="p-6">
              <div className="space-y-4">
                {[
                  { facility: "Metro General Hospital", region: "Northeast", fillRate: "98.5%", grade: "A+" },
                  { facility: "Regional Medical Center", region: "Midwest", fillRate: "96.2%", grade: "A" },
                  { facility: "City Healthcare Network", region: "Southwest", fillRate: "94.8%", grade: "A-" },
                  { facility: "Community Hospital", region: "Southeast", fillRate: "92.3%", grade: "B+" },
                ].map((item) => (
                  <div key={item.facility} className="flex items-center justify-between p-3 bg-shell-elevated rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.facility}</p>
                      <p className="text-sm text-shell-muted">{item.region} • {item.fillRate} Fill Rate</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">{item.grade}</p>
                      <p className="text-xs text-shell-muted">Grade</p>
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        </TabsContent>

        <TabsContent value="market" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard icon={Building2} label="Total Markets" value="47" change="+3 from last quarter" />
            <StatsCard icon={Users} label="Total Staff" value="18,542" change="+5.2% from last month" />
            <StatsCard icon={TrendingUp} label="Avg Fill Rate" value="94.8%" change="+2.1% from last month" />
            <StatsCard icon={Activity} label="Performance Score" value="8.7/10" change="+0.3 from last month" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentCard title="Market Performance" className="p-6">
              <div className="space-y-4">
                {[
                  { market: "Greater Chicago", performance: 96 },
                  { market: "Dallas-Fort Worth", performance: 94 },
                  { market: "Greater Houston", performance: 92 },
                  { market: "Phoenix Metro", performance: 89 },
                ].map((item) => (
                  <div key={item.market} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{item.market}</span>
                      <span className="text-shell-muted">{item.performance}%</span>
                    </div>
                    <div className="w-full bg-shell-muted/30 rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full transition-all" style={{ width: `${item.performance}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>

            <ContentCard title="Top Performing Markets" className="p-6">
              <div className="space-y-4">
                {[
                  { market: "Greater Chicago", facilities: 12, fillRate: "96.2%", grade: "A+" },
                  { market: "Dallas-Fort Worth", facilities: 15, fillRate: "94.8%", grade: "A" },
                  { market: "Greater Houston", facilities: 10, fillRate: "92.4%", grade: "A-" },
                  { market: "Phoenix Metro", facilities: 8, fillRate: "89.1%", grade: "B+" },
                ].map((item) => (
                  <div key={item.market} className="flex items-center justify-between p-3 bg-shell-elevated rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.market}</p>
                      <p className="text-sm text-shell-muted">{item.facilities} facilities</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{item.fillRate}</p>
                      <p className="text-sm text-primary">{item.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        </TabsContent>

        <TabsContent value="facility" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard icon={Building} label="Total Facilities" value="342" change="+8 from last quarter" />
            <StatsCard icon={Users} label="Avg Staff per Facility" value="156" change="+3.2% from last month" />
            <StatsCard icon={TrendingUp} label="Avg Fill Rate" value="93.2%" change="+1.8% from last month" />
            <StatsCard icon={Activity} label="Performance Score" value="8.5/10" change="+0.4 from last month" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentCard title="Facility Performance" className="p-6">
              <div className="space-y-4">
                {[
                  { facility: "Memorial Hospital - Chicago", performance: 97 },
                  { facility: "Regional Medical Center - Dallas", performance: 95 },
                  { facility: "Community Hospital - Houston", performance: 91 },
                  { facility: "Metro Health - Phoenix", performance: 88 },
                ].map((item) => (
                  <div key={item.facility} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{item.facility}</span>
                      <span className="text-shell-muted">{item.performance}%</span>
                    </div>
                    <div className="w-full bg-shell-muted/30 rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full transition-all" style={{ width: `${item.performance}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>

            <ContentCard title="Top Performing Facilities" className="p-6">
              <div className="space-y-4">
                {[
                  { facility: "Memorial Hospital - Chicago", departments: 18, fillRate: "97.1%", grade: "A+" },
                  { facility: "Regional Medical Center - Dallas", departments: 22, fillRate: "95.3%", grade: "A" },
                  { facility: "Community Hospital - Houston", departments: 15, fillRate: "91.6%", grade: "A-" },
                  { facility: "Metro Health - Phoenix", departments: 12, fillRate: "88.4%", grade: "B+" },
                ].map((item) => (
                  <div key={item.facility} className="flex items-center justify-between p-3 bg-shell-elevated rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.facility}</p>
                      <p className="text-sm text-shell-muted">{item.departments} departments</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{item.fillRate}</p>
                      <p className="text-sm text-primary">{item.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        </TabsContent>

        <TabsContent value="department" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard icon={Layers} label="Total Departments" value="2,847" change="+42 from last quarter" />
            <StatsCard icon={Users} label="Avg Staff per Dept" value="24" change="+2.1% from last month" />
            <StatsCard icon={TrendingUp} label="Avg Fill Rate" value="91.5%" change="+1.3% from last month" />
            <StatsCard icon={Activity} label="Performance Score" value="8.3/10" change="+0.2 from last month" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentCard title="Department Performance" className="p-6">
              <div className="space-y-4">
                {[
                  { department: "Emergency Department", performance: 96 },
                  { department: "Intensive Care Unit", performance: 94 },
                  { department: "Medical-Surgical", performance: 89 },
                  { department: "Radiology", performance: 86 },
                ].map((item) => (
                  <div key={item.department} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{item.department}</span>
                      <span className="text-shell-muted">{item.performance}%</span>
                    </div>
                    <div className="w-full bg-shell-muted/30 rounded-full h-2">
                      <div className="bg-gradient-primary h-2 rounded-full transition-all" style={{ width: `${item.performance}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>

            <ContentCard title="Top Performing Departments" className="p-6">
              <div className="space-y-4">
                {[
                  { department: "Emergency Department", positions: 48, fillRate: "96.3%", grade: "A+" },
                  { department: "Intensive Care Unit", positions: 56, fillRate: "94.1%", grade: "A" },
                  { department: "Medical-Surgical", positions: 72, fillRate: "89.7%", grade: "B+" },
                  { department: "Radiology", positions: 32, fillRate: "86.2%", grade: "B" },
                ].map((item) => (
                  <div key={item.department} className="flex items-center justify-between p-3 bg-shell-elevated rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.department}</p>
                      <p className="text-sm text-shell-muted">{item.positions} positions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{item.fillRate}</p>
                      <p className="text-sm text-primary">{item.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
