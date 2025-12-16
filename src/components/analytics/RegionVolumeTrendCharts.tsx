import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { useRegionVolumeData } from "@/hooks/useRegionVolumeData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatCompact = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toString();
};

interface VolumeChartCardProps {
  title: string;
  data: { month: string; volume: number }[];
  color: string;
}

function VolumeChartCard({ title, data, color }: VolumeChartCardProps) {
  const hasData = data.some((d) => d.volume > 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
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
                width={45}
                className="fill-muted-foreground"
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), "Volume"]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function RegionVolumeTrendCharts() {
  const { allRegionsData, region1Data, region2Data, isLoading } = useRegionVolumeData();

  if (isLoading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <LogoLoader size="md" variant="pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <VolumeChartCard
        title="All Regions – Last 12 Months Volume"
        data={allRegionsData}
        color="hsl(var(--primary))"
      />
      <VolumeChartCard
        title="Region 1 – Last 12 Months Volume"
        data={region1Data}
        color="hsl(142, 76%, 36%)"
      />
      <VolumeChartCard
        title="Region 2 – Last 12 Months Volume"
        data={region2Data}
        color="hsl(221, 83%, 53%)"
      />
    </div>
  );
}
