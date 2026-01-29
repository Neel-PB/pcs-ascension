import { useState, useMemo, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { FilterBar } from "@/components/staffing/FilterBar";
import PositionPlanning from "./PositionPlanning";
import { VarianceAnalysis } from "./VarianceAnalysis";
import { ForecastTab } from "./ForecastTab";
import { SettingsTab } from "./SettingsTab";
import { NPSettingsTab } from "./NPSettingsTab";
import { DraggableSectionsContainer } from "@/components/staffing/DraggableSectionsContainer";
import { useKPIOrderStore } from "@/stores/useKPIOrderStore";
import { generateLast12MonthLabels } from "@/lib/utils";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";
import { WorkforceDrawer } from "@/components/workforce/WorkforceDrawer";
import { WorkforceDrawerTrigger } from "@/components/workforce/WorkforceDrawerTrigger";
import { useRBAC } from "@/hooks/useRBAC";
import { useOrgScopedFilters } from "@/hooks/useOrgScopedFilters";
import { LogoLoader } from "@/components/ui/LogoLoader";

export default function StaffingSummary() {
  const [activeTab, setActiveTab] = useState("summary");
  const { hasPermission, loading: rbacLoading } = useRBAC();
  const { defaultFilters, isLoading: orgScopedLoading, isReady: orgScopedReady } = useOrgScopedFilters();
  
  // State management for filters - initialized from org-scoped defaults
  const [selectedRegion, setSelectedRegion] = useState("all-regions");
  const [selectedMarket, setSelectedMarket] = useState("all-markets");
  const [selectedFacility, setSelectedFacility] = useState("all-facilities");
  const [selectedSubmarket, setSelectedSubmarket] = useState("all-submarkets");
  const [selectedPstat, setSelectedPstat] = useState("all-pstat");
  const [selectedLevel2, setSelectedLevel2] = useState("all-level2");
  const [selectedDepartment, setSelectedDepartment] = useState("all-departments");
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  
  // Get filter visibility permissions from RBAC
  const { getFilterPermissions } = useRBAC();
  
  // Initialize filters from org-scoped defaults once READY (not just loading=false)
  // For hidden filters (due to RBAC), auto-select the Access Scope default
  // Use isReady to ensure all data is fully loaded before applying defaults
  useEffect(() => {
    if (orgScopedReady && !rbacLoading && !filtersInitialized && defaultFilters) {
      const filterPerms = getFilterPermissions();
      
      // For filters the user CAN'T see, force-apply Access Scope defaults
      // This ensures data is filtered even when the dropdown isn't visible
      if (!filterPerms.region && defaultFilters.region !== "all-regions") {
        setSelectedRegion(defaultFilters.region);
      }
      if (!filterPerms.market && defaultFilters.market !== "all-markets") {
        setSelectedMarket(defaultFilters.market);
      }
      
      // Apply other defaults as before (for visible filters with restrictions)
      if (defaultFilters.market !== "all-markets") {
        setSelectedMarket(defaultFilters.market);
      }
      if (defaultFilters.facility !== "all-facilities") {
        setSelectedFacility(defaultFilters.facility);
      }
      if (defaultFilters.department !== "all-departments") {
        setSelectedDepartment(defaultFilters.department);
      }
      setFiltersInitialized(true);
    }
  }, [orgScopedReady, rbacLoading, filtersInitialized, defaultFilters, getFilterPermissions]);

  // Build tabs based on permissions
  const tabs = useMemo(() => {
    const baseTabs = [
      { id: "summary", label: "Summary" },
      { id: "planning", label: "Planned/Active Resources" },
      { id: "variance", label: "Variance Analysis" },
      { id: "forecasts", label: "Forecasts" },
    ];
    
    if (hasPermission("settings.volume_override")) {
      baseTabs.push({ id: "volume-settings", label: "Volume Settings" });
    }
    
    if (hasPermission("settings.np_override")) {
      baseTabs.push({ id: "np-settings", label: "NP Settings" });
    }
    
    return baseTabs;
  }, [hasPermission]);

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedMarket("all-markets");
    setSelectedFacility("all-facilities");
    setSelectedSubmarket("all-submarkets");
    setSelectedPstat("all-pstat");
    setSelectedLevel2("all-level2");
    setSelectedDepartment("all-departments");
  };

  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    setSelectedFacility("all-facilities");
    setSelectedSubmarket("all-submarkets");
    setSelectedPstat("all-pstat");
    setSelectedLevel2("all-level2");
    setSelectedDepartment("all-departments");
  };

  const handleFacilityChange = (value: string) => {
    setSelectedFacility(value);
    setSelectedPstat("all-pstat");
    setSelectedLevel2("all-level2");
    setSelectedDepartment("all-departments");
  };

  const handleSubmarketChange = (value: string) => {
    setSelectedSubmarket(value);
  };

  const handlePstatChange = (value: string) => {
    setSelectedPstat(value);
  };

  const handleLevel2Change = (value: string) => {
    setSelectedLevel2(value);
  };

  const handleClearFilters = () => {
    setSelectedRegion("all-regions");
    setSelectedMarket("all-markets");
    setSelectedFacility("all-facilities");
    setSelectedSubmarket("all-submarkets");
    setSelectedPstat("all-pstat");
    setSelectedLevel2("all-level2");
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
        definition: "Vacancy Rate measures the percentage of Approved budgeted positions that are currently unfilled.",
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
        definition: "Total Full-time, Part-Time and PRNs equivalent labor resources currently employed by the organization (PRNs counted as 0.2 FTEs commitment).",
        calculation: `Hired FTEs = Sum of all active employee FTEs

Includes:
• Full-time staff (1.0 FTE each)
• Part-time staff (0.5, 0.8, etc.)
• Active employees only (excludes open positions)`,
        // Breakdown now represents combined Hired FTEs + Open Reqs split
        employmentBreakdown: { ft: 62, pt: 23, prn: 15 },
        breakdownVariant: 'red' as const,
      },
      {
        id: 'target-ftes',
        title: "Target FTEs",
        value: "43.4",
        chartData: generateSeasonalTrend(43.4, 2),
        chartType: "area" as const,
        delay: 0.1,
        definition: "The number of resources needed to meet budgeted staffing levels based on specific type and amount of Unit of Service.",
        calculation: `Target FTEs = (Expected Volume × Hours per Unit) / (Standard Hours per FTE × Expected Productivity %)

Determined by:
• Historical volume patterns
• Industry productivity benchmarks
• Department-specific standards`,
        employmentBreakdown: { ft: 70, pt: 20, prn: 10 },
        breakdownVariant: 'green' as const,
      },
      {
        id: 'fte-variance',
        title: "FTE Variance",
        value: "2.5",
        chartData: generateGrowthTrend(1.7, 2.5),
        chartType: "area" as const,
        delay: 0.15,
        definition: "Variance between Hired FTEs and Target FTEs.",
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
        decimalPlaces: 0,
        definition: "The number of approved requisitions that have not yet been successfully filled.",
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
        definition: "Variance between Hire FTEs plus Open Requisition and Target FTEs.",
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
    // Generate month labels for all Volume KPIs
    const monthLabels = generateLast12MonthLabels();
    
    const kpis = [
      {
        id: '12m-monthly',
        title: "12M Average",
        value: "633.5",
        chartData: generateGrowthTrend(565, 633.5, 30),
        chartType: "area" as const,
        delay: 0,
        xAxisLabels: monthLabels,
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
        xAxisLabels: monthLabels,
        definition: "12-Month Average Daily Volume represents the average number of patient encounters, procedures, or units of service delivered per day over the past 12 months.",
        calculation: `12M Avg Daily = Total volume over 12 months / Total working days

Example: If total volume is 7,602 over 365 days:
7,602 / 365 = 20.8 average per day`,
      },
      {
        id: '3m-low',
        title: "3M Low",
        value: "14.2",
        chartData: generateVolatileTrend(14.2, 3),
        chartType: "area" as const,
        delay: 0.1,
        xAxisLabels: monthLabels,
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
        xAxisLabels: monthLabels,
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
        xAxisLabels: monthLabels,
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
        xAxisLabels: monthLabels,
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
        definition: "Total labor resources the organization actually pays for, regardless of whether those hours are productive or non-productive.",
        calculation: `Total Paid Actual FTEs = Total paid hours / Standard FTE hours

Example: If 7,928 hours were paid in a 2-week period:
7,928 / (40 hours × 2 weeks × 52 periods) = 38.2 FTEs`,
        breakdownData: [
          { skillType: 'RN', ftFtes: 45.0, ptFtes: 25.0, prnFtes: 8.5, totalActualPaidFtes: 78.5 },
          { skillType: 'Clinical Lead', ftFtes: 15.0, ptFtes: 5.0, prnFtes: 2.5, totalActualPaidFtes: 22.5 },
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
        definition: "Total equivalent labor resources supplied by entities that are not Acute Ascension Hospitals, that are paid for and used by the organization.",
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
        definition: "Total worked hours above regular (FT) commitment the organization actually pays for.",
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
        definition: "Total PRNs productive equivalent labor resources the organization actually pays for.",
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
        value: "9.7%",
        chartData: generateGrowthTrend(8.1, 9.7),
        chartType: "area" as const,
        delay: 0.2,
        definition: "The percentage of all paid hours that were not spent directly delivering patient care or performing operational work tied to Patient Volume (e.g., PTO, Holiday Pay, sick leave, education, admin or committee time, Training or onboarding).",
        calculation: `Total NP% = Total non-productive Man hours/ Total Paid hours *100

Example: If 776 Non productive hours and 7,928 total paid hours:
(776 / 7,928) × 100 = 9.7%

Lower NP% indicates better labor efficiency`,
      },
      {
        id: 'total-fullpart-ftes',
        title: "EMPLOYED PRODUCTIVE FTES",
        value: "35.3 / 5.6",
        chartData: generateGrowthTrend(33.8, 40.9),
        chartType: "bar" as const,
        delay: 0.25,
        definition: "Total Full-time, Part-Time and PRNs productive equivalent labor resources the organization actually pays for.",
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

  // Page-level loading guard: don't render animated content until critical data is ready
  const isInitializing = rbacLoading || (orgScopedLoading && !filtersInitialized);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--header-height)-2rem)]">
        <LogoLoader size="lg" />
      </div>
    );
  }

  return (
    <>
      <WorkforceDrawerTrigger />
      <WorkforceDrawer 
        activeTab={activeTab} 
        selectedDepartment={selectedDepartment === "all-departments" ? null : selectedDepartment}
        selectedRegion={selectedRegion === "all-regions" ? null : selectedRegion}
        selectedMarket={selectedMarket === "all-markets" ? null : selectedMarket}
        selectedFacility={selectedFacility === "all-facilities" ? null : selectedFacility}
        selectedLevel2={selectedLevel2 === "all-level2" ? null : selectedLevel2}
        selectedPstat={selectedPstat === "all-pstat" ? null : selectedPstat}
      />
      
      <div className="space-y-6">
        {/* Filters */}
        <div className="py-2">
        <FilterBar 
          onRegionChange={handleRegionChange}
          onMarketChange={handleMarketChange}
          onFacilityChange={handleFacilityChange}
          onSubmarketChange={handleSubmarketChange}
          onPstatChange={handlePstatChange}
          onLevel2Change={handleLevel2Change}
          onDepartmentChange={setSelectedDepartment}
          selectedRegion={selectedRegion}
          selectedMarket={selectedMarket}
          selectedFacility={selectedFacility}
          selectedSubmarket={selectedSubmarket}
          selectedPstat={selectedPstat}
          selectedLevel2={selectedLevel2}
          selectedDepartment={selectedDepartment}
          onClearFilters={handleClearFilters}
        />
      </div>

      <LayoutGroup>
        <div className="relative bg-background rounded-lg p-1 mb-6">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`relative flex items-center justify-center px-4 py-2 text-sm font-medium transition-all z-10 hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === tab.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.id)}
                style={{ flex: 1 }}
              >
                {tab.label}
              </button>
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

      <div className="space-y-6">
        {activeTab === "summary" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">KPIs</h2>
                <DataRefreshButton dataSources={['staffing_grid', 'labor_uos_data']} />
              </div>
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
            </div>
          )}
          
          {activeTab === "planning" && (
            <PositionPlanning selectedDepartment={selectedDepartment} />
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
            <ForecastTab 
              selectedRegion={selectedRegion}
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
              selectedDepartment={selectedDepartment}
              selectedLevel2={selectedLevel2}
              selectedPstat={selectedPstat}
            />
          )}
          
          {activeTab === "volume-settings" && (
            <SettingsTab 
              selectedMarket={selectedMarket}
              selectedFacility={selectedFacility}
            />
          )}
          
        {activeTab === "np-settings" && (
          <NPSettingsTab 
            selectedMarket={selectedMarket}
            selectedFacility={selectedFacility}
          />
        )}
      </div>
      </div>
    </>
  );
}