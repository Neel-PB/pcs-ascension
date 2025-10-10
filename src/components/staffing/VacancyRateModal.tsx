import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

export interface VacancyBySkillType {
  skillType: string;
  vacancyRate: number;
  vacancyCount: number;
  totalPositions: number;
}

interface VacancyRateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: string | number;
  data: VacancyBySkillType[];
}

export function VacancyRateModal({
  open,
  onOpenChange,
  title,
  value,
  data,
}: VacancyRateModalProps) {
  const [sortField, setSortField] = useState<keyof VacancyBySkillType>("vacancyRate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Calculate statistics
  const avgVacancyRate = data.reduce((sum, item) => sum + item.vacancyRate, 0) / data.length;
  const highestVacancy = Math.max(...data.map((item) => item.vacancyRate));
  const lowestVacancy = Math.min(...data.map((item) => item.vacancyRate));
  const totalVacancies = data.reduce((sum, item) => sum + item.vacancyCount, 0);
  const totalPositions = data.reduce((sum, item) => sum + item.totalPositions, 0);

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return sortDirection === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
  });

  const handleSort = (field: keyof VacancyBySkillType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getVacancyColor = (rate: number) => {
    if (rate >= 15) return "text-destructive";
    if (rate >= 10) return "text-orange-500";
    if (rate >= 5) return "text-yellow-500";
    return "text-emerald-500";
  };

  const getVacancyBadgeVariant = (rate: number) => {
    if (rate >= 15) return "destructive";
    if (rate >= 10) return "default";
    return "secondary";
  };

  // Prepare chart data (sorted by vacancy rate for better visualization)
  const chartData = [...data].sort((a, b) => b.vacancyRate - a.vacancyRate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <span className="text-3xl font-bold text-foreground ml-4">{value}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="chart" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="flex-1 overflow-y-auto space-y-4 mt-4">
            {/* Statistics Summary */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Average</div>
                <div className="text-lg font-bold">{avgVacancyRate.toFixed(1)}%</div>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Highest</div>
                <div className="text-lg font-bold text-destructive">{highestVacancy.toFixed(1)}%</div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Lowest</div>
                <div className="text-lg font-bold text-emerald-500">{lowestVacancy.toFixed(1)}%</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Total Vacancies</div>
                <div className="text-lg font-bold">{totalVacancies} / {totalPositions}</div>
              </div>
            </div>

            {/* Chart */}
            <div className="w-full" style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="vacancyGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    type="number"
                    domain={[0, Math.ceil(highestVacancy / 5) * 5]}
                    label={{ value: "Vacancy Rate (%)", position: "bottom", offset: 0 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="skillType"
                    width={110}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as VacancyBySkillType;
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold mb-1">{data.skillType}</p>
                            <p className="text-sm text-muted-foreground">
                              Vacancy Rate: <span className="font-bold">{data.vacancyRate.toFixed(1)}%</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Vacant: <span className="font-bold">{data.vacancyCount}</span> / {data.totalPositions}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    x={avgVacancyRate}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label={{ value: "Avg", position: "top" }}
                  />
                  <Bar
                    dataKey="vacancyRate"
                    fill="url(#vacancyGradient)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="table" className="flex-1 overflow-y-auto mt-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("skillType")}
                    >
                      <div className="flex items-center gap-2">
                        Skill Type
                        {sortField === "skillType" && (
                          <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors text-right"
                      onClick={() => handleSort("vacancyRate")}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Vacancy Rate
                        {sortField === "vacancyRate" && (
                          <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors text-right"
                      onClick={() => handleSort("vacancyCount")}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Vacancy Count
                        {sortField === "vacancyCount" && (
                          <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((item) => (
                    <TableRow key={item.skillType} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{item.skillType}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={getVacancyBadgeVariant(item.vacancyRate)}
                          className={cn("font-mono", getVacancyColor(item.vacancyRate))}
                        >
                          {item.vacancyRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.vacancyCount} / {item.totalPositions}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="font-mono">
                        {((totalVacancies / totalPositions) * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {totalVacancies} / {totalPositions}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
