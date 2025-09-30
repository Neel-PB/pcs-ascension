import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ColumnMapping {
  excelColumn: string;
  dbColumn: string | null;
  dataType?: string;
  hasIssue?: boolean;
}

interface ColumnMappingStepProps {
  excelColumns: string[];
  dbColumns: { name: string; type: string }[];
  mapping: Record<string, string | null>;
  onMappingChange: (excelColumn: string, dbColumn: string | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ColumnMappingStep({
  excelColumns,
  dbColumns,
  mapping,
  onMappingChange,
  onConfirm,
  onCancel,
}: ColumnMappingStepProps) {
  const getMappedCount = () => {
    return Object.values(mapping).filter(v => v !== null).length;
  };

  const getDbColumnType = (dbColumn: string | null) => {
    if (!dbColumn) return null;
    const col = dbColumns.find(c => c.name === dbColumn);
    return col?.type;
  };

  const isFullyMapped = getMappedCount() === excelColumns.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">Column Mapping</h4>
          <p className="text-xs text-muted-foreground">
            Map Excel columns to database fields
          </p>
        </div>
        <Badge variant={isFullyMapped ? "default" : "secondary"}>
          {getMappedCount()} / {excelColumns.length} mapped
        </Badge>
      </div>

      {!isFullyMapped && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some columns are not mapped. Unmapped columns will be ignored during import.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {excelColumns.map((excelCol) => {
          const mappedDbCol = mapping[excelCol];
          const dbType = getDbColumnType(mappedDbCol);
          
          return (
            <Card key={excelCol} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{excelCol}</span>
                    <Badge variant="outline" className="text-xs">Excel</Badge>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground" />

                <div className="flex-1">
                  <Select
                    value={mappedDbCol || "__skip__"}
                    onValueChange={(value) => 
                      onMappingChange(excelCol, value === "__skip__" ? null : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select database column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__skip__">Skip this column</SelectItem>
                      {dbColumns.map((dbCol) => (
                        <SelectItem key={dbCol.name} value={dbCol.name}>
                          {dbCol.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({dbCol.type})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {mappedDbCol && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
              </div>

              {mappedDbCol && dbType && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Will map to: <code className="bg-muted px-1 py-0.5 rounded">{mappedDbCol}</code>
                  {" "}({dbType})
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={getMappedCount() === 0}>
          Apply Mapping
        </Button>
      </div>
    </div>
  );
}
