import { useState } from "react";
import { useForecastBalance } from "@/hooks/useForecastBalance";
import { ForecastKPICards } from "@/components/forecast/ForecastKPICards";
import { ForecastBalanceTable } from "@/components/forecast/ForecastBalanceTable";

export function ForecastTab() {
  const { data, isLoading } = useForecastBalance();
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
    <div className="space-y-6">
      {/* Two Large KPIs */}
      <ForecastKPICards
        totalShortage={data?.totalShortage ?? 0}
        totalSurplus={data?.totalSurplus ?? 0}
        shortageCount={data?.shortageCount ?? 0}
        surplusCount={data?.surplusCount ?? 0}
        isLoading={isLoading}
        activeFilter={activeFilter}
        onFilterClick={handleFilterClick}
      />

      {/* Smart Table */}
      <ForecastBalanceTable
        rows={filteredRows}
        isLoading={isLoading}
      />
    </div>
  );
}
