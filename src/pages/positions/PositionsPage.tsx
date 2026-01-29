import { useState, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { FilterBar } from "@/components/staffing/FilterBar";
import { EmployeesTab } from "./EmployeesTab";
import { ContractorsTab } from "./ContractorsTab";
import { RequisitionsTab } from "./RequisitionsTab";
import { WorkforceDrawer } from "@/components/workforce/WorkforceDrawer";
import { WorkforceDrawerTrigger } from "@/components/workforce/WorkforceDrawerTrigger";
import { useOrgScopedFilters } from "@/hooks/useOrgScopedFilters";
import { useRBAC } from "@/hooks/useRBAC";
import { LogoLoader } from "@/components/ui/LogoLoader";

export default function PositionsPage() {
  const [activeTab, setActiveTab] = useState("employees");
  const { defaultFilters, isLoading: orgScopedLoading } = useOrgScopedFilters();
  const { getFilterPermissions, loading: rbacLoading } = useRBAC();
  
  // State management for filters - initialized from org-scoped defaults
  const [selectedRegion, setSelectedRegion] = useState("all-regions");
  const [selectedMarket, setSelectedMarket] = useState("all-markets");
  const [selectedFacility, setSelectedFacility] = useState("all-facilities");
  const [selectedPstat, setSelectedPstat] = useState("all-pstat");
  const [selectedLevel2, setSelectedLevel2] = useState("all-level2");
  const [selectedDepartment, setSelectedDepartment] = useState("all-departments");
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  
  // Initialize filters from org-scoped defaults once loaded
  // For hidden filters (due to RBAC), auto-select the Access Scope default
  useEffect(() => {
    if (!orgScopedLoading && !rbacLoading && !filtersInitialized && defaultFilters) {
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
  }, [orgScopedLoading, rbacLoading, filtersInitialized, defaultFilters, getFilterPermissions]);

  // Page-level loading guard: don't render animated content until critical data is ready
  const isInitializing = orgScopedLoading && !filtersInitialized;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--header-height)-2rem)]">
        <LogoLoader size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: "employees", label: "Employees" },
    { id: "contractors", label: "Contractors" },
    { id: "requisitions", label: "Requisitions" },
  ];

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedMarket("all-markets");
    setSelectedFacility("all-facilities");
    setSelectedPstat("all-pstat");
    setSelectedLevel2("all-level2");
    setSelectedDepartment("all-departments");
  };

  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    setSelectedFacility("all-facilities");
    setSelectedPstat("all-pstat");
    setSelectedLevel2("all-level2");
    setSelectedDepartment("all-departments");
  };

  const handleFacilityChange = (value: string) => {
    setSelectedFacility(value);
    setSelectedDepartment("all-departments");
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
    setSelectedPstat("all-pstat");
    setSelectedLevel2("all-level2");
    setSelectedDepartment("all-departments");
  };

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
      
      <div className="flex flex-col h-full space-y-6">
        <div className="flex-shrink-0 py-2">
          <FilterBar
            selectedRegion={selectedRegion}
            selectedMarket={selectedMarket}
            selectedFacility={selectedFacility}
            selectedPstat={selectedPstat}
            selectedLevel2={selectedLevel2}
            selectedDepartment={selectedDepartment}
            onRegionChange={handleRegionChange}
            onMarketChange={handleMarketChange}
            onFacilityChange={handleFacilityChange}
            onPstatChange={handlePstatChange}
            onLevel2Change={handleLevel2Change}
            onDepartmentChange={setSelectedDepartment}
            onClearFilters={handleClearFilters}
          />
        </div>

        <LayoutGroup>
          <div className="relative bg-background rounded-lg p-1 flex-shrink-0 mb-6">
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
                layoutId="positionsTabIndicator"
                className="absolute inset-y-1 bg-primary rounded-sm"
                initial={false}
                animate={{
                  left: `${(tabs.findIndex((t) => t.id === activeTab) / tabs.length) * 100}%`,
                  width: `${100 / tabs.length}%`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            </div>
          </div>
        </LayoutGroup>

        <div className="flex-1 min-h-0 flex flex-col">
            {activeTab === "employees" && (
              <EmployeesTab
                selectedRegion={selectedRegion}
                selectedMarket={selectedMarket}
                selectedFacility={selectedFacility}
                selectedPstat={selectedPstat}
                selectedLevel2={selectedLevel2}
                selectedDepartment={selectedDepartment}
              />
            )}
            {activeTab === "contractors" && (
              <ContractorsTab
                selectedRegion={selectedRegion}
                selectedMarket={selectedMarket}
                selectedFacility={selectedFacility}
                selectedPstat={selectedPstat}
                selectedLevel2={selectedLevel2}
                selectedDepartment={selectedDepartment}
              />
            )}
            {activeTab === "requisitions" && (
              <RequisitionsTab
                selectedRegion={selectedRegion}
                selectedMarket={selectedMarket}
                selectedFacility={selectedFacility}
                selectedPstat={selectedPstat}
                selectedLevel2={selectedLevel2}
                selectedDepartment={selectedDepartment}
              />
            )}
        </div>
      </div>
    </>
  );
}
