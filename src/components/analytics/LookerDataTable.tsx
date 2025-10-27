import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

interface LookerDataTableProps {
  columns: Column[];
  data: Record<string, any>[];
}

export const LookerDataTable = ({ columns, data }: LookerDataTableProps) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={`font-semibold ${
                  column.align === "right" ? "text-right" : 
                  column.align === "center" ? "text-center" : 
                  "text-left"
                }`}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx} className="hover:bg-muted/30">
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  className={`${
                    column.align === "right" ? "text-right" : 
                    column.align === "center" ? "text-center" : 
                    "text-left"
                  }`}
                >
                  {row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
