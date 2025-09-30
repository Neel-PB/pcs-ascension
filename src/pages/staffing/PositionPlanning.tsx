import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface VarianceData {
  skill: string;
  targetDay: number;
  targetNight: number;
  targetTotal: number;
  hiredDay: number;
  hiredNight: number;
  hiredTotal: number;
  reqsDay: number;
  reqsNight: number;
  reqsTotal: number;
  varianceDay: number;
  varianceNight: number;
  varianceTotal: number;
}

const varianceData: VarianceData[] = [
  {
    skill: "RN DIR",
    targetDay: 0,
    targetNight: 0,
    targetTotal: 0,
    hiredDay: 0,
    hiredNight: 0,
    hiredTotal: 0,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "RN MGR",
    targetDay: 1.0,
    targetNight: 0,
    targetTotal: 1.0,
    hiredDay: 1.0,
    hiredNight: 0,
    hiredTotal: 1.0,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "RN AST MGR",
    targetDay: 1.0,
    targetNight: 0,
    targetTotal: 1.0,
    hiredDay: 1.0,
    hiredNight: 0,
    hiredTotal: 1.0,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "CORD",
    targetDay: 0,
    targetNight: 0,
    targetTotal: 0,
    hiredDay: 0,
    hiredNight: 0,
    hiredTotal: 0,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "SPEC",
    targetDay: 0,
    targetNight: 0,
    targetTotal: 0,
    hiredDay: 0,
    hiredNight: 0,
    hiredTotal: 0,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "CL",
    targetDay: 2.4,
    targetNight: 2.4,
    targetTotal: 4.8,
    hiredDay: 1.8,
    hiredNight: 1.8,
    hiredTotal: 3.6,
    reqsDay: 0.6,
    reqsNight: 0.6,
    reqsTotal: 1.2,
    varianceDay: 0.6,
    varianceNight: 0.6,
    varianceTotal: 1.2,
  },
  {
    skill: "RN",
    targetDay: 14.3,
    targetNight: 14.3,
    targetTotal: 28.6,
    hiredDay: 13.8,
    hiredNight: 13.8,
    hiredTotal: 27.6,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: -0.5,
    varianceNight: -0.5,
    varianceTotal: -1.0,
  },
  {
    skill: "PCT",
    targetDay: 9.6,
    targetNight: 9.6,
    targetTotal: 19.2,
    hiredDay: 9.2,
    hiredNight: 9.2,
    hiredTotal: 18.4,
    reqsDay: 0.8,
    reqsNight: 0.8,
    reqsTotal: 1.6,
    varianceDay: 0.4,
    varianceNight: 0.4,
    varianceTotal: 0.8,
  },
  {
    skill: "CLERK",
    targetDay: 4.8,
    targetNight: 4.8,
    targetTotal: 9.6,
    hiredDay: 4.8,
    hiredNight: 4.8,
    hiredTotal: 9.6,
    reqsDay: 0,
    reqsNight: 0,
    reqsTotal: 0,
    varianceDay: 0,
    varianceNight: 0,
    varianceTotal: 0,
  },
  {
    skill: "TOTAL",
    targetDay: 33.1,
    targetNight: 31.1,
    targetTotal: 64.2,
    hiredDay: 31.6,
    hiredNight: 29.6,
    hiredTotal: 61.2,
    reqsDay: 1.4,
    reqsNight: 1.4,
    reqsTotal: 2.8,
    varianceDay: -0.1,
    varianceNight: -0.1,
    varianceTotal: -0.2,
  },
];

const getVarianceColor = (value: number) => {
  if (value < 0) return "bg-green-100 text-green-900";
  if (value > 0) return "bg-red-100 text-red-900";
  if (value === 0) return "bg-yellow-50 text-yellow-900";
  return "";
};

export default function PositionPlanning() {
  return (
    <div className="space-y-6">
      {/* Header with Legend */}
      <div className="flex items-center justify-between">
        <motion.h1
          className="text-2xl font-semibold text-foreground"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          FTE Skill Shift Variance Analysis
        </motion.h1>

        {/* Legend */}
        <motion.div
          className="flex items-center gap-6 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">FTE Surplus (Negative)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">FTE Shortage (Positive)</span>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        className="bg-card rounded-xl border shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-foreground w-32">Skills</TableHead>
                <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30">
                  Target FTEs
                </TableHead>
                <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30">
                  Hired FTEs
                </TableHead>
                <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30">
                  Reqs
                </TableHead>
                <TableHead colSpan={3} className="text-center font-semibold text-foreground bg-muted/30">
                  Variance
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead></TableHead>
                {/* Target FTEs */}
                <TableHead className="text-center text-xs">Day</TableHead>
                <TableHead className="text-center text-xs">Night</TableHead>
                <TableHead className="text-center text-xs">Total</TableHead>
                {/* Hired FTEs */}
                <TableHead className="text-center text-xs">Day</TableHead>
                <TableHead className="text-center text-xs">Night</TableHead>
                <TableHead className="text-center text-xs">Total</TableHead>
                {/* Reqs */}
                <TableHead className="text-center text-xs">Day</TableHead>
                <TableHead className="text-center text-xs">Night</TableHead>
                <TableHead className="text-center text-xs">Total</TableHead>
                {/* Variance */}
                <TableHead className="text-center text-xs">Day</TableHead>
                <TableHead className="text-center text-xs">Night</TableHead>
                <TableHead className="text-center text-xs">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {varianceData.map((row, index) => (
                <TableRow
                  key={row.skill}
                  className={cn(
                    row.skill === "TOTAL" && "font-semibold bg-muted/20 border-t-2"
                  )}
                >
                  <TableCell className="font-medium">{row.skill}</TableCell>
                  {/* Target FTEs */}
                  <TableCell className="text-center">{row.targetDay || "0"}</TableCell>
                  <TableCell className="text-center">{row.targetNight || "0"}</TableCell>
                  <TableCell className="text-center">{row.targetTotal || "0"}</TableCell>
                  {/* Hired FTEs */}
                  <TableCell className="text-center">{row.hiredDay || "0"}</TableCell>
                  <TableCell className="text-center">{row.hiredNight || "0"}</TableCell>
                  <TableCell className="text-center">{row.hiredTotal || "0"}</TableCell>
                  {/* Reqs */}
                  <TableCell className="text-center">{row.reqsDay || "0"}</TableCell>
                  <TableCell className="text-center">{row.reqsNight || "0"}</TableCell>
                  <TableCell className="text-center">{row.reqsTotal || "0"}</TableCell>
                  {/* Variance */}
                  <TableCell className={cn("text-center", getVarianceColor(row.varianceDay))}>
                    {row.varianceDay || "0"}
                  </TableCell>
                  <TableCell className={cn("text-center", getVarianceColor(row.varianceNight))}>
                    {row.varianceNight || "0"}
                  </TableCell>
                  <TableCell className={cn("text-center", getVarianceColor(row.varianceTotal))}>
                    {row.varianceTotal || "0"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
