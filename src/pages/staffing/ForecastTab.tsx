import { useForecastBalance } from "@/hooks/useForecastBalance";
import { ForecastKPICards } from "@/components/forecast/ForecastKPICards";
import { ForecastBalanceTable } from "@/components/forecast/ForecastBalanceTable";
import { DataRefreshButton } from "@/components/dashboard/DataRefreshButton";

export function ForecastTab() {
  const { data, isLoading } = useForecastBalance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workforce Forecast</h2>
          <p className="text-muted-foreground mt-1">
            70/20/10 employment mix balancing and FTE gap analysis
          </p>
        </div>
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
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Position Balance Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Click on a row to view current vs recommended employment mix breakdown
        </p>
        <ForecastBalanceTable
          rows={data?.rows ?? []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
