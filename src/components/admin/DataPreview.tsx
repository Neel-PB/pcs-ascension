import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface DataPreviewProps {
  data: any[];
  tableName: string;
}

export function DataPreview({ data, tableName }: DataPreviewProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const previewData = data.slice(0, 10);
  const columns = Object.keys(previewData[0]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">Data Preview</h4>
          <p className="text-xs text-muted-foreground">
            Showing first 10 of {data.length} records
          </p>
        </div>
        <Badge variant="secondary">{tableName}</Badge>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="whitespace-nowrap">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column} className="whitespace-nowrap">
                    {row[column]?.toString() || "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
