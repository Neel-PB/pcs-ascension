import { useState } from "react";
import { KPICard } from "@/components/staffing/KPICard";
import { FilterBar } from "@/components/staffing/FilterBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PositionPlanning from "./PositionPlanning";
import { VarianceAnalysis } from "./VarianceAnalysis";

export default function StaffingSummary() {
  // State management for filters
  const [selectedRegion, setSelectedRegion] = useState("all-regions");
  const [selectedMarket, setSelectedMarket] = useState("all-markets");
  const [selectedFacility, setSelectedFacility] = useState("all-facilities");
  const [selectedDepartment, setSelectedDepartment] = useState("all-departments");

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedMarket("all-markets");
    setSelectedFacility("all-facilities");
    setSelectedDepartment("all-departments");
  };

  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    setSelectedFacility("all-facilities");
    setSelectedDepartment("all-departments");
  };

  const handleFacilityChange = (value: string) => {
    setSelectedFacility(value);
    setSelectedDepartment("all-departments");
  };
  // Realistic chart data generators
  const generateGrowthTrend = (start: number, end: number, points: number = 24) => 
    Array.from({ length: points }, (_, i) => ({
      value: start + ((end - start) * i) / (points - 1) + (Math.random() - 0.5) * 2
    }));

  const generateDeclineTrend = (start: number, end: number, points: number = 24) =>
    Array.from({ length: points }, (_, i) => ({
      value: start - ((start - end) * i) / (points - 1) + (Math.random() - 0.5) * 2
    }));

  const generateVolatileTrend = (base: number, variance: number, points: number = 24) =>
    Array.from({ length: points }, (_, i) => ({
      value: base + Math.sin(i * 0.5) * variance + (Math.random() - 0.5) * (variance * 0.3)
    }));

  const generateSeasonalTrend = (base: number, amplitude: number, points: number = 24) =>
    Array.from({ length: points }, (_, i) => ({
      value: base + Math.sin((i / points) * Math.PI * 2) * amplitude + (Math.random() - 0.5) * 2
    }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="py-2">
        <FilterBar 
          onRegionChange={handleRegionChange}
          onMarketChange={handleMarketChange}
          onFacilityChange={handleFacilityChange}
          onDepartmentChange={setSelectedDepartment}
          selectedRegion={selectedRegion}
          selectedMarket={selectedMarket}
          selectedFacility={selectedFacility}
          selectedDepartment={selectedDepartment}
        />
      </div>

      <Tabs defaultValue="summary" className="w-full">
        {/* Tab Navigation */}
        <div className="bg-shell-elevated rounded-xl p-2 shadow-soft mb-6">
          <TabsList className="grid w-full grid-cols-5 gap-1">
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
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              <KPICard
                title="Vacancy Rate"
                value="13.9%"
                trend="down"
                trendValue="2.1%"
                chartData={generateDeclineTrend(16, 13.9)}
                chartType="area"
                delay={0}
                definition="Vacancy Rate measures the percentage of authorized positions that are currently unfilled. A lower rate indicates better staffing levels and improved operational capacity."
                calculation="Vacancy Rate = (Vacant Positions / Total Authorized Positions) × 100

Example: If you have 6 vacant positions and 43.4 total authorized positions:
(6 / 43.4) × 100 = 13.8%"
              />
              <KPICard
                title="Hired FTEs"
                value="40.9"
                trend="up"
                trendValue="3.2"
                chartData={generateGrowthTrend(37, 40.9)}
                chartType="bar"
                delay={0.05}
                definition="Hired FTEs represents the total number of full-time equivalent employees currently employed and actively working in the department."
                calculation="Hired FTEs = Sum of all active employee FTEs

Includes:
• Full-time staff (1.0 FTE each)
• Part-time staff (0.5, 0.8, etc.)
• Active employees only (excludes open positions)"
              />
              <KPICard
                title="Target FTEs"
                value="43.4"
                chartData={generateSeasonalTrend(43.4, 2)}
                chartType="area"
                delay={0.1}
                definition="Target FTEs represents the planned number of full-time equivalent employees needed to meet operational requirements based on workload analysis and productivity standards."
                calculation="Target FTEs = (Expected Volume × Hours per Unit) / (Standard Hours per FTE × Expected Productivity %)

Determined by:
• Historical volume patterns
• Industry productivity benchmarks
• Department-specific standards"
              />
              <KPICard
                title="FTE Variance"
                value="2.5"
                isNegative
                trend="up"
                trendValue="0.8"
                chartData={generateGrowthTrend(1.7, 2.5)}
                chartType="area"
                delay={0.15}
                definition="FTE Variance shows the difference between target FTEs and hired FTEs. A positive variance indicates understaffing, while a negative variance indicates overstaffing."
                calculation="FTE Variance = Target FTEs - Hired FTEs

Example: If target is 43.4 and hired is 40.9:
43.4 - 40.9 = 2.5 FTE shortage"
              />
              <KPICard
                title="Open Reqs"
                value="5"
                chartData={generateVolatileTrend(5, 2)}
                chartType="bar"
                delay={0.2}
                definition="Open Requisitions represents the total number of approved job postings that are currently active and being recruited for. This includes positions that are in various stages of the hiring process."
                calculation="Open Requisitions = Count of all active job postings

Includes:
• Approved requisitions in recruiting
• Positions being screened/interviewed
• Offers extended but not yet accepted
Excludes: Filled positions, withdrawn postings"
              />
              <KPICard
                title="Req Variance"
                value="2.5"
                trend="up"
                trendValue="1.2"
                chartData={generateGrowthTrend(1.3, 2.5)}
                chartType="line"
                delay={0.25}
                definition="Requisition Variance shows the difference between FTE Variance and Open Requisitions. It indicates whether current recruiting efforts will meet staffing needs."
                calculation="Requisition Variance = FTE Variance - Open Requisitions

Example: If FTE Variance is 2.5 and Open Requisitions is 5:
2.5 - 5 = -2.5 (over-recruiting by 2.5 positions)"
              />
            </div>
          </div>

          {/* Volume Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Volume</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              <KPICard
                title="12M Monthly"
                value="633.5"
                trend="up"
                trendValue="12.3%"
                chartData={generateGrowthTrend(565, 633.5, 30)}
                chartType="area"
                delay={0}
                definition="12-Month Average Monthly Volume represents the average number of patient encounters, procedures, or units of service delivered per month over the past 12 months."
                calculation="12M Avg Monthly = Sum of monthly volumes over 12 months / 12

Example: If total volume over 12 months is 7,602:
7,602 / 12 = 633.5 average per month"
              />
              <KPICard
                title="12M Daily"
                value="20.8"
                trend="up"
                trendValue="5.2%"
                chartData={generateGrowthTrend(19.8, 20.8, 30)}
                chartType="area"
                delay={0.05}
                definition="12-Month Average Daily Volume represents the average number of patient encounters, procedures, or units of service delivered per day over the past 12 months."
                calculation="12M Avg Daily = Total volume over 12 months / Total working days

Example: If total volume is 7,602 over 365 days:
7,602 / 365 = 20.8 average per day"
              />
              <KPICard
                title="3M Low"
                value="14.2"
                trend="down"
                trendValue="3.1%"
                isNegative
                chartData={generateVolatileTrend(14.2, 3)}
                chartType="area"
                delay={0.1}
                definition="3-Month Average Lowest Volume shows the average daily volume during the lowest-volume period in the past 3 months. This helps identify minimum staffing requirements."
                calculation="3M Avg Lowest = Average daily volume during the lowest 3-month period

Calculated by:
• Identifying the lowest volume month in past 3 months
• Calculating average daily volume for that month
• Used for minimum staffing level planning"
              />
              <KPICard
                title="3M High"
                value="28.4"
                trend="up"
                trendValue="8.7%"
                chartData={generateVolatileTrend(28.4, 5)}
                chartType="bar"
                delay={0.15}
                definition="3-Month Average Highest Volume shows the average daily volume during the highest-volume period in the past 3 months. This helps identify peak staffing requirements."
                calculation="3M Avg Highest = Average daily volume during the highest 3-month period

Calculated by:
• Identifying the highest volume month in past 3 months
• Calculating average daily volume for that month
• Used for peak staffing level planning"
              />
              <KPICard
                title="Target Vol"
                value="20.8"
                isHighlighted
                chartData={generateSeasonalTrend(20.8, 3)}
                chartType="area"
                delay={0.2}
                definition="Target Volume represents the expected daily volume used for staffing calculations and planning. This is typically based on historical trends and projected growth."
                calculation="Target Volume = Forecasted daily volume based on historical data and growth projections

Determined by:
• 12-month historical average
• Seasonal adjustment factors
• Strategic growth targets
• Market conditions"
              />
              <KPICard
                title="Override Vol"
                value="24.7"
                chartData={generateVolatileTrend(24.7, 4)}
                chartType="bar"
                delay={0.25}
                definition="Override Volume is a manually adjusted volume target that supersedes the calculated target volume. Used when managers have specific knowledge of upcoming changes or special circumstances."
                calculation="Override Volume = Manually entered volume target

Used when:
• Known upcoming service changes
• Special projects or initiatives
• Temporary capacity adjustments
• Market-specific factors not in historical data"
              />
            </div>
          </div>

          {/* Productivity Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Productivity</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              <KPICard
                title="Paid FTEs"
                value="38.2"
                trend="up"
                trendValue="2.4"
                chartData={generateGrowthTrend(35.8, 38.2)}
                chartType="bar"
                delay={0}
                definition="Total Paid Actual FTEs represents the actual number of FTEs based on paid hours during the reporting period. This includes regular, overtime, and other paid time."
                calculation="Total Paid Actual FTEs = Total paid hours / Standard FTE hours

Example: If 7,928 hours were paid in a 2-week period:
7,928 / (40 hours × 2 weeks × 52 periods) = 38.2 FTEs"
              />
              <KPICard
                title="Contract FTEs"
                value="5.7"
                chartData={generateSeasonalTrend(5.7, 1.2)}
                chartType="bar"
                delay={0.05}
                definition="Total Contract Actual FTEs represents the number of contract labor FTEs (travelers, agency staff) working during the reporting period. These are temporary staff hired through external agencies."
                calculation="Total Contract Actual FTEs = Contract hours worked / Standard FTE hours

Includes:
• Travel nurses
• Agency staff
• Temporary contractors
Excludes: Regular staff, PRN staff"
              />
              <KPICard
                title="Overtime FTEs"
                value="2.1"
                trend="down"
                trendValue="0.3"
                chartData={generateDeclineTrend(2.4, 2.1)}
                chartType="area"
                delay={0.1}
                definition="Total Overtime FTEs represents the equivalent number of FTEs based on overtime hours worked. High overtime can indicate understaffing or inefficient scheduling."
                calculation="Total Overtime FTEs = Total overtime hours / Standard FTE hours

Example: If 436 overtime hours worked in 2 weeks:
436 / (40 × 2) = 5.45 overtime FTE equivalent
Note: This is the volume equivalent, not cost equivalent"
              />
              <KPICard
                title="Total PRN"
                value="12.4"
                trend="up"
                trendValue="1.8"
                chartData={generateGrowthTrend(10.6, 12.4)}
                chartType="bar"
                delay={0.15}
                definition="Total PRN (Pro Re Nata - as needed) represents the number of FTEs working on an as-needed basis. PRN staff provide flexibility but may have higher costs and less continuity."
                calculation="Total PRN = PRN hours worked / Standard FTE hours

PRN staff characteristics:
• No guaranteed hours
• Work as needed/on-call
• Typically higher hourly rate
• Used for volume fluctuations and coverage"
              />
              <KPICard
                title="Total NP%"
                value="89.3%"
                trend="up"
                trendValue="3.2%"
                chartData={generateGrowthTrend(86.1, 89.3)}
                chartType="area"
                delay={0.2}
                definition="Total Net Productivity Percentage (NP%) measures the percentage of paid hours that are spent on productive (direct patient care or service delivery) activities versus non-productive time."
                calculation="Total NP% = (Productive Hours / Total Paid Hours) × 100

Example: If 7,076 productive hours and 7,928 total paid hours:
(7,076 / 7,928) × 100 = 89.3%

Higher NP% indicates better labor efficiency"
              />
              <KPICard
                title="Missed Targets"
                value="1.8"
                isNegative
                trend="up"
                trendValue="0.5"
                chartData={generateGrowthTrend(1.3, 1.8)}
                chartType="area"
                delay={0.25}
                definition="Missed Productivity Targets FTEs represents the additional FTE capacity that would have been available if productivity targets were met. This indicates potential efficiency improvements."
                calculation="Missed Prod Targets FTEs = (Target Productivity - Actual Productivity) × Total Paid FTEs

Example: If target NP% is 92% and actual is 89.3%:
(92% - 89.3%) × 38.2 FTEs / 92% = 1.12 FTE capacity lost

Indicates room for productivity improvement"
              />
            </div>
          </div>
        </TabsContent>

        {/* Position Planning Tab Content */}
        <TabsContent value="planning" className="mt-0">
          <PositionPlanning />
        </TabsContent>

        {/* Variance Analysis Tab Content */}
        <TabsContent value="variance" className="mt-0">
            <VarianceAnalysis 
              selectedRegion={selectedRegion}
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
              selectedDepartment={selectedDepartment}
            />
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