import { useForecastBalance } from "@/hooks/useForecastBalance";
import { ForecastKPICards } from "@/components/forecast/ForecastKPICards";
import { ForecastBalanceTable } from "@/components/forecast/ForecastBalanceTable";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";

export function ForecastTab() {
  const { data, isLoading } = useForecastBalance();

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <DataRefreshButton dataSources={['positions']} />
      </div>

      {/* Two Large KPIs */}
      <ForecastKPICards
        totalShortage={data?.totalShortage ?? 0}
        totalSurplus={data?.totalSurplus ?? 0}
        shortageCount={data?.shortageCount ?? 0}
        surplusCount={data?.surplusCount ?? 0}
        isLoading={isLoading}
      />

      {/* Smart Table */}
      <ForecastBalanceTable
        rows={data?.rows ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
