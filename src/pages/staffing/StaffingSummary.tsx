import { KPICard } from "@/components/staffing/KPICard";
import { FilterBar } from "@/components/staffing/FilterBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PositionPlanning from "./PositionPlanning";

export default function StaffingSummary() {
  // Sample chart data generators
  const generateTrendData = (base: number, variance: number = 5) => 
    Array.from({ length: 12 }, (_, i) => ({ 
      value: base + Math.random() * variance - variance / 2 
    }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="py-2">
        <FilterBar />
      </div>

      <Tabs defaultValue="summary" className="w-full">
        {/* Tab Navigation */}
        <div className="bg-shell-elevated rounded-xl p-2 shadow-soft mb-6">
          <TabsList className="grid w-full grid-cols-5 bg-transparent gap-1">
            <TabsTrigger value="summary" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Summary
            </TabsTrigger>
            <TabsTrigger value="planning" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Position Planning
            </TabsTrigger>
            <TabsTrigger value="variance" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Variance Analysis
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Forecasts
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Summary Tab Content */}
        <TabsContent value="summary" className="space-y-8 mt-0">
          {/* FTE Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">FTE</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <KPICard
                title="Vacancy Rate"
                value="13.9%"
                trend="down"
                trendValue="2.1%"
                chartData={generateTrendData(14, 3)}
                chartType="line"
                delay={0}
              />
              <KPICard
                title="Hired FTEs"
                value="40.9"
                trend="up"
                trendValue="3.2"
                chartData={generateTrendData(40, 5)}
                chartType="bar"
                delay={0.05}
              />
              <KPICard
                title="Target FTEs"
                value="43.4"
                chartData={generateTrendData(43, 2)}
                chartType="line"
                delay={0.1}
              />
              <KPICard
                title="FTE Variance"
                value="2.5"
                isNegative
                trend="up"
                trendValue="0.8"
                chartData={generateTrendData(2.5, 1.5)}
                chartType="bar"
                delay={0.15}
              />
              <KPICard
                title="Open Requisitions"
                value="5"
                chartData={generateTrendData(5, 2)}
                chartType="bar"
                delay={0.2}
              />
              <KPICard
                title="Requisition Variance"
                value="2.5"
                trend="up"
                trendValue="1.2"
                chartData={generateTrendData(2, 1)}
                chartType="line"
                delay={0.25}
              />
            </div>
          </div>

          {/* Volume Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Volume</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <KPICard
                title="12M Avg Monthly"
                value="633.5"
                trend="up"
                trendValue="12.3%"
                chartData={generateTrendData(630, 40)}
                chartType="line"
                delay={0}
              />
              <KPICard
                title="12M Avg Daily"
                value="20.8"
                trend="up"
                trendValue="5.2%"
                chartData={generateTrendData(20, 3)}
                chartType="line"
                delay={0.05}
              />
              <KPICard
                title="3M Avg Lowest"
                value="14.2"
                trend="down"
                trendValue="3.1%"
                isNegative
                chartData={generateTrendData(15, 2)}
                chartType="bar"
                delay={0.1}
              />
              <KPICard
                title="3M Avg Highest"
                value="28.4"
                trend="up"
                trendValue="8.7%"
                chartData={generateTrendData(28, 4)}
                chartType="bar"
                delay={0.15}
              />
              <KPICard
                title="Target Volume"
                value="20.8"
                isHighlighted
                chartData={generateTrendData(21, 2)}
                chartType="line"
                delay={0.2}
              />
              <KPICard
                title="Override Volume"
                value="24.7"
                chartData={generateTrendData(24, 3)}
                chartType="bar"
                delay={0.25}
              />
            </div>
          </div>

          {/* Productivity Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Productivity</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <KPICard
                title="Total Paid Actual FTEs"
                value="38.2"
                trend="up"
                trendValue="2.4"
                chartData={generateTrendData(38, 4)}
                chartType="bar"
                delay={0}
              />
              <KPICard
                title="Total Contract Actual FTEs"
                value="5.7"
                chartData={generateTrendData(6, 1)}
                chartType="bar"
                delay={0.05}
              />
              <KPICard
                title="Total Overtime FTEs"
                value="2.1"
                trend="down"
                trendValue="0.3"
                chartData={generateTrendData(2, 0.5)}
                chartType="line"
                delay={0.1}
              />
              <KPICard
                title="Total PRN"
                value="12.4"
                trend="up"
                trendValue="1.8"
                chartData={generateTrendData(12, 2)}
                chartType="bar"
                delay={0.15}
              />
              <KPICard
                title="Total NP%"
                value="89.3%"
                trend="up"
                trendValue="3.2%"
                chartData={generateTrendData(89, 5)}
                chartType="line"
                delay={0.2}
              />
              <KPICard
                title="Missed Prod Targets FTEs"
                value="1.8"
                isNegative
                trend="up"
                trendValue="0.5"
                chartData={generateTrendData(1.8, 0.8)}
                chartType="bar"
                delay={0.25}
              />
            </div>
          </div>
        </TabsContent>

        {/* Position Planning Tab Content */}
        <TabsContent value="planning" className="mt-0">
          <PositionPlanning />
        </TabsContent>

        {/* Placeholder tabs */}
        <TabsContent value="variance" className="mt-0">
          <div className="text-center py-12 text-muted-foreground">
            Variance Analysis content coming soon
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="mt-0">
          <div className="text-center py-12 text-muted-foreground">
            Forecasts content coming soon
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <div className="text-center py-12 text-muted-foreground">
            Settings content coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}