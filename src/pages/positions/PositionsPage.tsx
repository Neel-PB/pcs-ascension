import { useState } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
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
  const [selectedDepartmentFamily, setSelectedDepartmentFamily] = useState("all-dept-families");
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
    setSelectedDepartmentFamily("all-dept-families");
    setSelectedDepartment("all-departments");
  };

  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    setSelectedFacility("all-facilities");
    setSelectedDepartmentFamily("all-dept-families");
    setSelectedDepartment("all-departments");
  };

  const handleFacilityChange = (value: string) => {
    setSelectedFacility(value);
    setSelectedDepartmentFamily("all-dept-families");
    setSelectedDepartment("all-departments");
  };

  const handleDepartmentFamilyChange = (value: string) => {
    setSelectedDepartmentFamily(value);
    setSelectedDepartment("all-departments");
  };

  const handleClearFilters = () => {
    setSelectedRegion("all-regions");
    setSelectedMarket("all-markets");
    setSelectedFacility("all-facilities");
    setSelectedDepartmentFamily("all-dept-families");
    setSelectedDepartment("all-departments");
  };

  return (
    <>
      <WorkforceDrawerTrigger />
      <WorkforceDrawer activeTab={activeTab} />
      
      <div className="flex flex-col h-full">
        <div className="py-2 flex-shrink-0">
          <FilterBar
            selectedRegion={selectedRegion}
            selectedMarket={selectedMarket}
            selectedFacility={selectedFacility}
            selectedDepartmentFamily={selectedDepartmentFamily}
            selectedDepartment={selectedDepartment}
            onRegionChange={handleRegionChange}
            onMarketChange={handleMarketChange}
            onFacilityChange={handleFacilityChange}
            onDepartmentFamilyChange={handleDepartmentFamilyChange}
            onDepartmentChange={setSelectedDepartment}
            onClearFilters={handleClearFilters}
          />
        </div>

        <LayoutGroup>
          <div className="relative bg-background rounded-lg p-1 mb-4 flex-shrink-0">
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
                layoutId="positionsTabIndicator"
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
            className="flex-1 min-h-0 flex flex-col"
          >
            {activeTab === "employees" && (
              <EmployeesTab
                selectedRegion={selectedRegion}
                selectedMarket={selectedMarket}
                selectedFacility={selectedFacility}
                selectedDepartmentFamily={selectedDepartmentFamily}
                selectedDepartment={selectedDepartment}
              />
            )}
            {activeTab === "contractors" && (
              <ContractorsTab
                selectedRegion={selectedRegion}
                selectedMarket={selectedMarket}
                selectedFacility={selectedFacility}
                selectedDepartmentFamily={selectedDepartmentFamily}
                selectedDepartment={selectedDepartment}
              />
            )}
            {activeTab === "requisitions" && (
              <RequisitionsTab
                selectedRegion={selectedRegion}
                selectedMarket={selectedMarket}
                selectedFacility={selectedFacility}
                selectedDepartmentFamily={selectedDepartmentFamily}
                selectedDepartment={selectedDepartment}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
