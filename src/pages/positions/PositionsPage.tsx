import { useState } from "react";
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
      <div className="py-2">
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
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <div className="bg-shell-elevated rounded-xl p-2 shadow-soft mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1">
            <TabsTrigger value="employees" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Employees
            </TabsTrigger>
            <TabsTrigger value="contractors" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Contractors
            </TabsTrigger>
            <TabsTrigger value="requisitions" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              Requisitions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="employees" className="mt-0">
          <EmployeesTab
            selectedRegion={selectedRegion}
            selectedMarket={selectedMarket}
            selectedFacility={selectedFacility}
            selectedDepartment={selectedDepartment}
          />
        </TabsContent>

        <TabsContent value="contractors" className="mt-0">
          <ContractorsTab
            selectedRegion={selectedRegion}
            selectedMarket={selectedMarket}
            selectedFacility={selectedFacility}
            selectedDepartment={selectedDepartment}
          />
        </TabsContent>

        <TabsContent value="requisitions" className="mt-0">
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
