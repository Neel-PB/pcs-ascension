import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { FilterBar } from "@/components/staffing/FilterBar";
import { EmployeesTab } from "./EmployeesTab";
import { ContractorsTab } from "./ContractorsTab";
import { RequisitionsTab } from "./RequisitionsTab";
import { WorkforceDrawer } from "@/components/workforce/WorkforceDrawer";
import { WorkforceDrawerTrigger } from "@/components/workforce/WorkforceDrawerTrigger";

export default function PositionsPage() {
  const [activeTab, setActiveTab] = useState("employees");
  
  // State management for filters
  const [selectedRegion, setSelectedRegion] = useState("all-regions");
  const [selectedMarket, setSelectedMarket] = useState("all-markets");
  const [selectedFacility, setSelectedFacility] = useState("all-facilities");
  const [selectedPstat, setSelectedPstat] = useState("all-pstat");
  const [selectedLevel2, setSelectedLevel2] = useState("all-level2");
  const [selectedDepartment, setSelectedDepartment] = useState("all-departments");

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
