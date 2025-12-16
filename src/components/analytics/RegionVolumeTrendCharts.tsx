import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { useRegionVolumeData } from "@/hooks/useRegionVolumeData";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const formatCompact = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toString();
};

const chartConfig = {
  region1: {
    label: "Region 1",
    color: "hsl(142, 76%, 36%)",
  },
  region2: {
    label: "Region 2",
    color: "hsl(221, 83%, 53%)",
  },
} satisfies ChartConfig;

export function RegionVolumeTrendCharts() {
  const { combinedData, isLoading } = useRegionVolumeData();

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <LogoLoader size="md" variant="pulse" />
      </div>
    );
  }

  const hasData = combinedData.some((d) => d.region1 > 0 || d.region2 > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Regional Volume Trends – Last 12 Months
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRegion1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-region1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-region1)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillRegion2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-region2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-region2)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                className="fill-muted-foreground"
              />
              <YAxis
                tickFormatter={formatCompact}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={50}
                className="fill-muted-foreground"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="region2"
                type="natural"
                fill="url(#fillRegion2)"
                stroke="var(--color-region2)"
                strokeWidth={2}
              />
              <Area
                dataKey="region1"
                type="natural"
                fill="url(#fillRegion1)"
                stroke="var(--color-region1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
