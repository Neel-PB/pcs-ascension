import { useState } from "react";
import { useForecastBalance } from "@/hooks/useForecastBalance";
import { ForecastKPICards } from "@/components/forecast/ForecastKPICards";
import { ForecastBalanceTable } from "@/components/forecast/ForecastBalanceTable";

interface ForecastTabProps {
  selectedRegion?: string;
  selectedMarket?: string;
  selectedFacility?: string;
  selectedDepartment?: string;
  selectedLevel2?: string;
  selectedPstat?: string;
}

export function ForecastTab({
  selectedRegion,
  selectedMarket,
  selectedFacility,
  selectedDepartment,
  selectedLevel2,
  selectedPstat,
}: ForecastTabProps) {
  // Transform filter values, handling "all-" prefixes
  const filters = {
    region: selectedRegion !== "all-regions" ? selectedRegion : undefined,
    market: selectedMarket !== "all-markets" ? selectedMarket : undefined,
    facilityId: selectedFacility !== "all-facilities" ? selectedFacility : undefined,
    departmentId: selectedDepartment !== "all-departments" ? selectedDepartment : undefined,
    level2: selectedLevel2 !== "all-level2" ? selectedLevel2 : undefined,
    pstat: selectedPstat !== "all-pstat" ? selectedPstat : undefined,
  };

  const { data, isLoading } = useForecastBalance(filters);
  const [activeFilter, setActiveFilter] = useState<'all' | 'shortage' | 'surplus'>('all');

  const handleFilterClick = (filter: 'shortage' | 'surplus') => {
    setActiveFilter(prev => prev === filter ? 'all' : filter);
  };

  const filteredRows = (data?.rows ?? []).filter(row => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'shortage') return row.gapType === 'shortage';
    if (activeFilter === 'surplus') return row.gapType === 'surplus';
    return true;
  });

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Two Large KPIs */}
      <div data-tour="forecast-kpi-cards">
        <ForecastKPICards
          totalShortage={data?.totalShortage ?? 0}
          totalSurplus={data?.totalSurplus ?? 0}
          shortageCount={data?.shortageCount ?? 0}
          surplusCount={data?.surplusCount ?? 0}
          isLoading={isLoading}
          activeFilter={activeFilter}
          onFilterClick={handleFilterClick}
        />
      </div>

      {/* Smart Table */}
      <div className="min-h-0 max-h-full">
        <ForecastBalanceTable
          rows={filteredRows}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
