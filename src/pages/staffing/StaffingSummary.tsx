import { useState, useMemo } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { FilterBar } from "@/components/staffing/FilterBar";
import PositionPlanning from "./PositionPlanning";
import { VarianceAnalysis } from "./VarianceAnalysis";
import { ForecastTab } from "./ForecastTab";
import { SettingsTab } from "./SettingsTab";
import { DraggableSectionsContainer } from "@/components/staffing/DraggableSectionsContainer";
import { useKPIOrderStore } from "@/stores/useKPIOrderStore";

export default function StaffingSummary() {
  const [activeTab, setActiveTab] = useState("summary");
  
  // State management for filters
  const [selectedRegion, setSelectedRegion] = useState("all-regions");
  const [selectedMarket, setSelectedMarket] = useState("all-markets");
  const [selectedFacility, setSelectedFacility] = useState("all-facilities");
  const [selectedDepartment, setSelectedDepartment] = useState("all-departments");

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "planning", label: "Position Planning" },
    { id: "variance", label: "Variance Analysis" },
    { id: "forecasts", label: "Forecasts" },
    { id: "settings", label: "Settings" },
  ];

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

  // KPI Order Store
  const { 
    fte: fteOrder, 
    volume: volumeOrder, 
    productivity: productivityOrder, 
    sectionOrder,
    setOrder,
    setSectionOrder 
  } = useKPIOrderStore();

  // FTE KPIs Configuration
  const fteKPIs = useMemo(() => {
    const kpis = [
      {
        id: 'vacancy-rate',
        title: "Vacancy Rate",
        value: "13.9%",
        chartData: generateDeclineTrend(16, 13.9),
        chartType: "bar" as const,
        delay: 0,
        definition: "Vacancy Rate measures the percentage of authorized positions that are currently unfilled. A lower rate indicates better staffing levels and improved operational capacity.",
        calculation: `Vacancy Rate = (Vacant Positions / Total Authorized Positions) × 100

Example: If you have 6 vacant positions and 43.4 total authorized positions:
(6 / 43.4) × 100 = 13.8%`,
      },
      {
        id: 'hired-ftes',
        title: "Hired FTEs",
        value: "40.9",
        chartData: generateGrowthTrend(37, 40.9),
        chartType: "bar" as const,
        delay: 0.05,
        definition: "Hired FTEs represents the total number of full-time equivalent employees currently employed and actively working in the department.",
        calculation: `Hired FTEs = Sum of all active employee FTEs

Includes:
• Full-time staff (1.0 FTE each)
• Part-time staff (0.5, 0.8, etc.)
• Active employees only (excludes open positions)`,
      },
      {
        id: 'target-ftes',
        title: "Target FTEs",
        value: "43.4",
        chartData: generateSeasonalTrend(43.4, 2),
        chartType: "area" as const,
        delay: 0.1,
        definition: "Target FTEs represents the planned number of full-time equivalent employees needed to meet operational requirements based on workload analysis and productivity standards.",
        calculation: `Target FTEs = (Expected Volume × Hours per Unit) / (Standard Hours per FTE × Expected Productivity %)

Determined by:
• Historical volume patterns
• Industry productivity benchmarks
• Department-specific standards`,
      },
      {
        id: 'fte-variance',
        title: "FTE Variance",
        value: "2.5",
        isNegative: true,
        chartData: generateGrowthTrend(1.7, 2.5),
        chartType: "area" as const,
        delay: 0.15,
        definition: "FTE Variance shows the difference between target FTEs and hired FTEs. A positive variance indicates understaffing, while a negative variance indicates overstaffing.",
        calculation: `FTE Variance = Target FTEs - Hired FTEs

Example: If target is 43.4 and hired is 40.9:
43.4 - 40.9 = 2.5 FTE shortage`,
      },
      {
        id: 'open-reqs',
        title: "Open Reqs",
        value: "5",
        chartData: generateVolatileTrend(5, 2),
        chartType: "bar" as const,
        delay: 0.2,
        definition: "Open Requisitions represents the total number of approved job postings that are currently active and being recruited for. This includes positions that are in various stages of the hiring process.",
        calculation: `Open Requisitions = Count of all active job postings

Includes:
• Approved requisitions in recruiting
• Positions being screened/interviewed
• Offers extended but not yet accepted
Excludes: Filled positions, withdrawn postings`,
      },
      {
        id: 'req-variance',
        title: "Req Variance",
        value: "2.5",
        chartData: generateGrowthTrend(1.3, 2.5),
        chartType: "line" as const,
        delay: 0.25,
        definition: "Requisition Variance shows the difference between FTE Variance and Open Requisitions. It indicates whether current recruiting efforts will meet staffing needs.",
        calculation: `Requisition Variance = FTE Variance - Open Requisitions

Example: If FTE Variance is 2.5 and Open Requisitions is 5:
2.5 - 5 = -2.5 (over-recruiting by 2.5 positions)`,
      },
    ];

    // Sort based on stored order
    return kpis.sort((a, b) => {
      const aIndex = fteOrder.indexOf(a.id);
      const bIndex = fteOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [fteOrder]);

  // Volume KPIs Configuration
  const volumeKPIs = useMemo(() => {
    const kpis = [
      {
        id: '12m-monthly',
        title: "12M Average",
        value: "633.5",
        chartData: generateGrowthTrend(565, 633.5, 30),
        chartType: "area" as const,
        delay: 0,
        definition: "Rolling 12-Month Average Monthly Volume represents the average number of patient encounters, procedures, or units of service delivered per month over the immediately preceding 12 months.",
        calculation: `12M Avg Monthly = Sum of monthly volumes over 12 months / 12

Example: If total volume over 12 months is 7,602:
7,602 / 12 = 633.5 average per month`,
      },
      {
        id: '12m-daily',
        title: "12M Daily Average",
        value: "20.8",
        chartData: generateGrowthTrend(19.8, 20.8, 30),
        chartType: "area" as const,
        delay: 0.05,
        definition: "12-Month Average Daily Volume represents the average number of patient encounters, procedures, or units of service delivered per day over the past 12 months.",
        calculation: `12M Avg Daily = Total volume over 12 months / Total working days

Example: If total volume is 7,602 over 365 days:
7,602 / 365 = 20.8 average per day`,
      },
      {
        id: '3m-low',
        title: "3M Low",
        value: "14.2",
        isNegative: true,
        chartData: generateVolatileTrend(14.2, 3),
        chartType: "area" as const,
        delay: 0.1,
        definition: "3-Month Average Lowest Volume shows the average daily volume recorded during the three months with the lowest total volume in the immediately preceding 12 months. This value is used to determine minimum staffing requirements.",
        calculation: `3M Avg Lowest = Average daily volume during the 3 lowest-volume months in past 12 months

Calculated by:
• Identifying the 3 consecutive months with lowest total volume in past 12 months
• Calculating average daily volume across those 3 months
• Used for minimum staffing level planning`,
      },
      {
        id: '3m-high',
        title: "3M High",
        value: "28.4",
        chartData: generateVolatileTrend(28.4, 5),
        chartType: "bar" as const,
        delay: 0.15,
        definition: "3-Month Average Highest Volume shows the average daily volume recorded during the three months with the highest total volume in the immediately preceding 12 months. This value is used to determine maximum capacity or peak staffing requirements.",
        calculation: `3M Avg Highest = Average daily volume during the 3 highest-volume months in past 12 months

Calculated by:
• Identifying the 3 consecutive months with highest total volume in past 12 months
• Calculating average daily volume across those 3 months
• Used for peak staffing level planning`,
      },
      {
        id: 'target-vol',
        title: "Target Vol",
        value: "20.8",
        isHighlighted: true,
        chartData: generateSeasonalTrend(20.8, 3),
        chartType: "area" as const,
        delay: 0.2,
        definition: "Target Volume represents the expected daily volume used for staffing calculations and planning. This is typically based on historical trends and projected growth.",
        calculation: `Target Volume = Forecasted daily volume based on historical data and growth projections

Determined by:
• 12-month historical average
• Seasonal adjustment factors
• Strategic growth targets
• Market conditions`,
      },
      {
        id: 'override-vol',
        title: "Override Vol",
        value: "24.7",
        chartData: generateVolatileTrend(24.7, 4),
        chartType: "bar" as const,
        delay: 0.25,
        definition: "Override Volume is a manually adjusted volume target that supersedes the calculated target volume. Used when managers have specific knowledge of upcoming changes or special circumstances.",
        calculation: `Override Volume = Manually entered volume target

Used when:
• Known upcoming service changes
• Special projects or initiatives
• Temporary capacity adjustments
• Market-specific factors not in historical data`,
      },
    ];

    // Sort based on stored order
    return kpis.sort((a, b) => {
      const aIndex = volumeOrder.indexOf(a.id);
      const bIndex = volumeOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [volumeOrder]);

  // Productivity KPIs Configuration
  const productivityKPIs = useMemo(() => {
    const kpis = [
      {
        id: 'paid-ftes',
        title: "Paid FTEs",
        value: "38.2",
        chartData: generateGrowthTrend(35.8, 38.2),
        chartType: "bar" as const,
        delay: 0,
        definition: "Total Paid Actual FTEs represents the actual number of FTEs based on paid hours during the reporting period. This includes regular, overtime, and other paid time.",
        calculation: `Total Paid Actual FTEs = Total paid hours / Standard FTE hours

Example: If 7,928 hours were paid in a 2-week period:
7,928 / (40 hours × 2 weeks × 52 periods) = 38.2 FTEs`,
        breakdownData: [
          { skillType: 'RN', ftFtes: 45.0, ptFtes: 25.0, prnFtes: 8.5, totalActualPaidFtes: 78.5 },
          { skillType: 'CL', ftFtes: 15.0, ptFtes: 5.0, prnFtes: 2.5, totalActualPaidFtes: 22.5 },
          { skillType: 'PCT', ftFtes: 10.0, ptFtes: 4.0, prnFtes: 1.0, totalActualPaidFtes: 15.0 },
          { skillType: 'RN Manager', ftFtes: 5.0, ptFtes: 2.0, prnFtes: 0.0, totalActualPaidFtes: 7.0 },
          { skillType: 'TOTAL', ftFtes: 75.0, ptFtes: 36.0, prnFtes: 12.0, totalActualPaidFtes: 123.0 },
        ],
      },
      {
        id: 'contract-ftes',
        title: "Contract FTEs",
        value: "5.7",
        chartData: generateSeasonalTrend(5.7, 1.2),
        chartType: "bar" as const,
        delay: 0.05,
        definition: "Total Contract Actual FTEs represents the number of contract labor FTEs (travelers, agency staff) working during the reporting period. These are temporary staff hired through external agencies.",
        calculation: `Total Contract Actual FTEs = Contract hours worked / Standard FTE hours

Includes:
• Travel nurses
• Agency staff
• Temporary contractors
Excludes: Regular staff, PRN staff`,
      },
      {
        id: 'overtime-ftes',
        title: "Overtime FTEs",
        value: "2.1",
        chartData: generateDeclineTrend(2.4, 2.1),
        chartType: "area" as const,
        delay: 0.1,
        definition: "Total Overtime FTEs represents the equivalent number of FTEs based on overtime hours worked. High overtime can indicate understaffing or inefficient scheduling.",
        calculation: `Total Overtime FTEs = Total overtime hours / Standard FTE hours

Example: If 436 overtime hours worked in 2 weeks:
436 / (40 × 2) = 5.45 overtime FTE equivalent
Note: This is the volume equivalent, not cost equivalent`,
      },
      {
        id: 'total-prn',
        title: "Total PRN",
        value: "12.4",
        chartData: generateGrowthTrend(10.6, 12.4),
        chartType: "bar" as const,
        delay: 0.15,
        definition: "Total PRN (Pro Re Nata - as needed) represents the number of FTEs working on an as-needed basis. PRN staff provide flexibility but may have higher costs and less continuity.",
        calculation: `Total PRN = PRN hours worked / Standard FTE hours

PRN staff characteristics:
• No guaranteed hours
• Work as needed/on-call
• Typically higher hourly rate
• Used for volume fluctuations and coverage`,
      },
      {
        id: 'total-np',
        title: "Total NP%",
        value: "89.3%",
        chartData: generateGrowthTrend(86.1, 89.3),
        chartType: "area" as const,
        delay: 0.2,
        definition: "Total Net Productivity Percentage (NP%) measures the percentage of paid hours that are spent on productive (direct patient care or service delivery) activities versus non-productive time.",
        calculation: `Total NP% = (Productive Hours / Total Paid Hours) × 100

Example: If 7,076 productive hours and 7,928 total paid hours:
(7,076 / 7,928) × 100 = 89.3%

Higher NP% indicates better labor efficiency`,
      },
      {
        id: 'total-fullpart-ftes',
        title: "Total Full/Part Time FTEs",
        value: "35.3 / 5.6",
        chartData: generateGrowthTrend(33.8, 40.9),
        chartType: "bar" as const,
        delay: 0.25,
        definition: "Total Full/Part Time FTEs shows the breakdown of hired employees by employment type. This helps understand workforce composition and scheduling flexibility.",
        calculation: `Full Time FTEs = Sum of all FTEs where employmentType = "Full Time"
Part Time FTEs = Sum of all FTEs where employmentType = "Part Time"

Example breakdown:
• Full Time: 35.3 FTEs (86.5%)
• Part Time: 5.6 FTEs (13.5%)
• Total: 40.9 FTEs

This metric helps:
• Understand workforce composition
• Plan for benefits and scheduling
• Analyze labor cost structure`,
      },
    ];

    // Sort based on stored order
    return kpis.sort((a, b) => {
      const aIndex = productivityOrder.indexOf(a.id);
      const bIndex = productivityOrder.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [productivityOrder]);

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
              layoutId="staffingTabIndicator"
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
          {activeTab === "summary" && (
                  <DraggableSectionsContainer
                    sections={[
                      {
                        id: 'fte',
                        title: 'FTE',
                        kpis: fteKPIs,
                      },
                      {
                        id: 'volume',
                        title: 'Volume',
                        kpis: volumeKPIs,
                      },
                      {
                        id: 'productivity',
                        title: 'Productive Resources',
                        kpis: productivityKPIs,
                      },
                    ]}
                    sectionOrder={sectionOrder}
                    onSectionReorder={setSectionOrder}
                  />
          )}
          
          {activeTab === "planning" && (
            <PositionPlanning />
          )}
          
          {activeTab === "variance" && (
            <VarianceAnalysis 
              selectedRegion={selectedRegion}
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
              selectedDepartment={selectedDepartment}
            />
          )}
          
          {activeTab === "forecasts" && (
            <ForecastTab />
          )}
          
          {activeTab === "settings" && (
            <SettingsTab 
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}