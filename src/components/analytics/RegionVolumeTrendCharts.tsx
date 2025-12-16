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
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatCompact = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toString();
};

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
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                width={50}
                className="fill-muted-foreground"
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name === "region1" ? "Region 1" : "Region 2",
                ]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend
                formatter={(value) => (value === "region1" ? "Region 1" : "Region 2")}
              />
              <Line
                type="monotone"
                dataKey="region1"
                name="region1"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(142, 76%, 36%)" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="region2"
                name="region2"
                stroke="hsl(221, 83%, 53%)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(221, 83%, 53%)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
