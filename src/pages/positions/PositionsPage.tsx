import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar } from "@/components/staffing/FilterBar";
import { EmployeesTab } from "./EmployeesTab";
import { ContractorsTab } from "./ContractorsTab";
import { RequisitionsTab } from "./RequisitionsTab";

export default function PositionsPage() {
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Positions Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage employees, contractors, and requisitions
        </p>
      </motion.div>

      <FilterBar
        selectedRegion={selectedRegion}
        selectedMarket={selectedMarket}
        selectedFacility={selectedFacility}
        selectedDepartment={selectedDepartment}
        onRegionChange={handleRegionChange}
        onMarketChange={handleMarketChange}
        onFacilityChange={handleFacilityChange}
        onDepartmentChange={setSelectedDepartment}
      />

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-2 bg-gradient-to-br from-muted/80 via-muted/60 to-muted/80 rounded-2xl shadow-lg backdrop-blur-sm border border-border/50">
          <TabsTrigger
            value="employees"
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl rounded-xl py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.02]"
          >
            Employees
          </TabsTrigger>
          <TabsTrigger
            value="contractors"
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl rounded-xl py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.02]"
          >
            Contractors
          </TabsTrigger>
          <TabsTrigger
            value="requisitions"
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl rounded-xl py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.02]"
          >
            Requisitions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-6">
          <EmployeesTab
            selectedRegion={selectedRegion}
            selectedMarket={selectedMarket}
            selectedFacility={selectedFacility}
            selectedDepartment={selectedDepartment}
          />
        </TabsContent>

        <TabsContent value="contractors" className="mt-6">
          <ContractorsTab
            selectedRegion={selectedRegion}
            selectedMarket={selectedMarket}
            selectedFacility={selectedFacility}
            selectedDepartment={selectedDepartment}
          />
        </TabsContent>

        <TabsContent value="requisitions" className="mt-6">
          <RequisitionsTab
            selectedRegion={selectedRegion}
            selectedMarket={selectedMarket}
            selectedFacility={selectedFacility}
            selectedDepartment={selectedDepartment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
