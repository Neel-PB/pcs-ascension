import { useState } from 'react';
import { BarChart3, Eye } from '@/lib/icons';
import { KPIChartModal } from '@/components/staffing/KPIChartModal';
import { KPIInfoModal } from '@/components/staffing/KPIInfoModal';

interface WorkforceKPICardProps {
  label: string;
  value: string | number | null;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isNegative?: boolean;
  chartData?: Array<{ value: number }>;
  chartType?: 'line' | 'bar' | 'area' | 'pie';
  definition?: string;
  calculation?: string;
  breakdownData?: Array<any>;
  xAxisLabels?: string[];
  decimalPlaces?: number;
  highlightPoints?: 'lowest-3' | 'highest-3';
  customChartContent?: React.ReactNode;
}

export const WorkforceKPICard = ({ 
  label, 
  value, 
  trend, 
  trendValue,
  isNegative,
  chartData,
  chartType = 'line',
  definition = '',
  calculation = '',
  breakdownData,
  xAxisLabels,
  decimalPlaces = 1,
  highlightPoints,
  customChartContent,
}: WorkforceKPICardProps) => {
  const [showChartModal, setShowChartModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const displayValue = value === null || value === undefined || value === '' ? '—' : value;
  
  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-foreground';
    if (isNegative) {
      return trend === 'up' ? 'text-destructive' : 'text-emerald-600';
    }
    return trend === 'up' ? 'text-emerald-600' : 'text-destructive';
  };

  const hasChartData = chartData && chartData.length > 0;

  return (
    <>
      <div className="bg-card border border-border rounded-md p-2.5 pr-8 relative">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
          {label}
        </p>
        <p className={`text-lg font-semibold mt-0.5 ${getTrendColor()}`}>
          {displayValue}
        </p>
        
        {/* Action Icons */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5">
          {hasChartData && (
            <button
              onClick={() => setShowChartModal(true)}
              className="p-1 rounded hover:bg-accent transition-colors"
              title="View chart"
            >
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-1 rounded hover:bg-accent transition-colors"
            title="View details"
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      </div>

      {/* Chart Modal */}
      <KPIChartModal
        open={showChartModal}
        onOpenChange={setShowChartModal}
        title={label}
        value={displayValue}
        trend={trend === 'neutral' ? undefined : trend}
        trendValue={trendValue}
        isNegative={isNegative}
        isHighlighted={false}
        chartData={chartData}
        chartType={chartType}
        breakdownData={breakdownData}
        xAxisLabels={xAxisLabels}
        decimalPlaces={decimalPlaces}
        highlightPoints={highlightPoints}
      />

      {/* Info Modal */}
      <KPIInfoModal
        open={showInfoModal}
        onOpenChange={setShowInfoModal}
        title={label}
        value={displayValue}
        trend={trend === 'neutral' ? undefined : trend}
        trendValue={trendValue}
        isNegative={isNegative}
        definition={definition}
        calculation={calculation}
      />
    </>
  );
};
