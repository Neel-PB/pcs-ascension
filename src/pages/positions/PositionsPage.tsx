import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";
import { FilterBar } from "@/components/staffing/FilterBar";
import { EmployeesTab } from "./EmployeesTab";
import { ContractorsTab } from "./ContractorsTab";
import { RequisitionsTab } from "./RequisitionsTab";
import { WorkforceDrawer } from "@/components/workforce/WorkforceDrawer";
import { WorkforceDrawerTrigger } from "@/components/workforce/WorkforceDrawerTrigger";
import { useOrgScopedFilters } from "@/hooks/useOrgScopedFilters";
import { useRBAC } from "@/hooks/useRBAC";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { useFilterStore } from "@/stores/useFilterStore";
import { PositionsTour } from "@/components/tour/PositionsTour";

export default function PositionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validTabs = ["employees", "contractors", "requisitions"];
  const [activeTab, setActiveTab] = useState(
    tabParam && validTabs.includes(tabParam) ? tabParam : "employees"
  );
  const { defaultFilters, isLoading: orgScopedLoading, isReady: orgScopedReady } = useOrgScopedFilters();
  const { getFilterPermissions, loading: rbacLoading } = useRBAC();
  
  // Shared filter store
  const {
    selectedRegion,
    selectedMarket,
    selectedFacility,
    selectedPstat,
    selectedLevel2,
    selectedDepartment,
    filtersInitialized,
    setRegion,
    setMarket,
    setFacility,
    setPstat,
    setLevel2,
    setDepartment,
    initializeFromDefaults,
    clearFilters,
  } = useFilterStore();
  
  // Clear tab search param after consumption
  useEffect(() => {
    if (tabParam) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('tab');
        return next;
      }, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize filters from org-scoped defaults once ready (one-shot via store)
  useEffect(() => {
    if (orgScopedReady && !rbacLoading && !filtersInitialized && defaultFilters) {
      const filterPerms = getFilterPermissions();
      initializeFromDefaults(defaultFilters, {
        region: filterPerms.region,
        market: filterPerms.market,
      });
    }
  }, [orgScopedReady, rbacLoading, filtersInitialized, defaultFilters, getFilterPermissions, initializeFromDefaults]);

  // Page-level loading guard
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
    { id: "requisitions", label: "Open Positions" },
  ];

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
      
      <div className="flex flex-col h-full space-y-6 overflow-hidden">
        <div className="flex-shrink-0 py-2" data-tour="filter-bar">
          <FilterBar
            selectedRegion={selectedRegion}
            selectedMarket={selectedMarket}
            selectedFacility={selectedFacility}
            selectedPstat={selectedPstat}
            selectedLevel2={selectedLevel2}
            selectedDepartment={selectedDepartment}
            onRegionChange={setRegion}
            onMarketChange={setMarket}
            onFacilityChange={setFacility}
            onPstatChange={setPstat}
            onLevel2Change={setLevel2}
            onDepartmentChange={setDepartment}
            onClearFilters={() => clearFilters(defaultFilters)}
          />
        </div>

        <div className="flex-shrink-0 mb-6 flex justify-center" data-tour="positions-tabs">
          <ToggleButtonGroup
            items={tabs}
            activeId={activeTab}
            onSelect={setActiveTab}
            layoutId="positionsToggle"
          />
        </div>

        <PositionsTour activeTab={activeTab} onTabChange={setActiveTab} />

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
