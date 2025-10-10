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
  Cell,
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

  // Helper function to get bar color based on vacancy rate
  const getBarColor = (rate: number) => {
    if (rate >= 15) return "hsl(0, 84%, 60%)"; // red
    if (rate >= 10) return "hsl(25, 95%, 53%)"; // orange
    if (rate >= 5) return "hsl(45, 93%, 47%)"; // yellow
    return "hsl(142, 71%, 45%)"; // green
  };

  // Prepare chart data (sorted by vacancy rate for better visualization)
  const chartData = [...data].sort((a, b) => b.vacancyRate - a.vacancyRate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <span className="text-3xl font-bold text-foreground ml-4">{value}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="chart" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="flex-1 flex flex-col space-y-4 mt-4 min-h-0 overflow-y-auto pr-2">
            {/* Statistics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
              <div className="p-3 bg-muted rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Average</div>
                <div className="text-lg font-bold">{avgVacancyRate.toFixed(1)}%</div>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Highest</div>
                <div className="text-lg font-bold text-destructive">{highestVacancy.toFixed(1)}%</div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Lowest</div>
                <div className="text-lg font-bold text-emerald-500">{lowestVacancy.toFixed(1)}%</div>
              </div>
              <div className="p-3 bg-muted rounded-lg border">
                <div className="text-xs text-muted-foreground mb-1">Total Vacancies</div>
                <div className="text-lg font-bold">{totalVacancies} / {totalPositions}</div>
              </div>
            </div>

            {/* Chart - Fixed height container */}
            <div className="flex-shrink-0 w-full h-[480px] bg-card rounded-lg border p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    type="category"
                    dataKey="skillType"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis
                    type="number"
                    domain={[0, Math.ceil(highestVacancy / 5) * 5]}
                    label={{ value: "Vacancy Rate (%)", angle: -90, position: "insideLeft" }}
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
                    y={avgVacancyRate}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label={{ value: `Avg: ${avgVacancyRate.toFixed(1)}%`, position: "right", fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Bar
                    dataKey="vacancyRate"
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.vacancyRate)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-4 min-h-0">
            <div className="h-[600px] overflow-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
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
                <TableFooter className="sticky bottom-0 bg-background z-10">
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
