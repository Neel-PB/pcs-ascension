import { useState } from "react";
import { FileUploadZone } from "@/components/admin/FileUploadZone";
import { DataPreview } from "@/components/admin/DataPreview";
import { ImportProgress } from "@/components/admin/ImportProgress";
import { ColumnMappingStep } from "@/components/admin/ColumnMappingStep";
import { useDataImport } from "@/hooks/useDataImport";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, Settings2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database['public']['Tables'];

const TABLE_SCHEMAS: Record<TableName, { name: string; type: string }[]> = {
  staffing_standards: [
    { name: "market", type: "text" },
    { name: "facilityId", type: "text" },
    { name: "facilityName", type: "text" },
    { name: "departmentId", type: "text" },
    { name: "departmentName", type: "text" },
  ],
  labor_performance: [
    { name: "market", type: "text" },
    { name: "facilityId", type: "text" },
    { name: "facilityName", type: "text" },
    { name: "departmentId", type: "text" },
    { name: "departmentName", type: "text" },
    { name: "volume", type: "numeric" },
    { name: "manhours", type: "numeric" },
    { name: "laborHoursPerUoS", type: "numeric" },
    { name: "month", type: "timestamp" },
    { name: "actual_fte", type: "numeric" },
  ],
  positions: [
    { name: "positionLifecycle", type: "text" },
    { name: "employmentFlag", type: "text" },
    { name: "positionStatus", type: "text" },
    { name: "positionStatusDate", type: "date" },
    { name: "market", type: "text" },
    { name: "positionNum", type: "text" },
    { name: "facilityId", type: "text" },
    { name: "facilityName", type: "text" },
    { name: "departmentId", type: "text" },
    { name: "departmentName", type: "text" },
    { name: "employeeType", type: "text" },
    { name: "employmentType", type: "text" },
    { name: "shift", type: "text" },
    { name: "jobcode", type: "text" },
    { name: "jobFamily", type: "text" },
    { name: "jobTitle", type: "text" },
    { name: "FTE", type: "numeric" },
    { name: "standardHours", type: "numeric" },
    { name: "payrollStatus", type: "text" },
    { name: "employeeName", type: "text" },
    { name: "employeeId", type: "text" },
    { name: "managerPositionNum", type: "text" },
    { name: "managerEmployeeId", type: "text" },
    { name: "managerName", type: "text" },
  ],
  markets: [{ name: "market", type: "text" }],
  facilities: [
    { name: "market", type: "text" },
    { name: "facility_id", type: "text" },
    { name: "facility_name", type: "text" },
  ],
  departments: [
    { name: "facility_id", type: "text" },
    { name: "department_id", type: "text" },
    { name: "department_name", type: "text" },
  ],
  comments: [],
  data_refresh_log: [],
  notifications: [],
  position_comments: [],
  post_likes: [],
  posts: [],
  profiles: [],
  user_roles: [],
  user_organization_access: [],
};

export default function DataImportPage() {
  const [selectedTable, setSelectedTable] = useState<TableName>("staffing_standards");
  const [showMapping, setShowMapping] = useState(false);
  const {
    file,
    setFile,
    parsedData,
    columnMapping,
    setColumnMapping,
    mappedData,
    applyMapping,
    validateMappedData,
    isImporting,
    importProgress,
    importData,
    downloadTemplate,
  } = useDataImport();

  const handleImport = async () => {
    if (!mappedData || mappedData.length === 0) {
      toast.error("Please apply column mapping first");
      return;
    }

    const success = await importData(selectedTable);
    if (success) {
      setFile(null);
      setShowMapping(false);
    }
  };

  const handleMappingConfirm = () => {
    applyMapping();
    setShowMapping(false);
  };

  const getExcelColumns = (): string[] => {
    if (!parsedData || parsedData.length === 0) return [];
    return Object.keys(parsedData[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Data Import</h3>
          <p className="text-sm text-muted-foreground">
            Upload Excel files to import data into your database
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => downloadTemplate(selectedTable)}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Table</label>
          <Select value={selectedTable} onValueChange={(value) => setSelectedTable(value as TableName)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="staffing_standards">Staffing Standards</SelectItem>
              <SelectItem value="labor_performance">Labor Performance</SelectItem>
              <SelectItem value="positions">Positions</SelectItem>
              <SelectItem value="markets">Markets</SelectItem>
              <SelectItem value="facilities">Facilities</SelectItem>
              <SelectItem value="departments">Departments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <FileUploadZone file={file} onFileSelect={setFile} />

        {parsedData && parsedData.length > 0 && !showMapping && !mappedData && (
          <>
            <DataPreview data={parsedData} tableName={selectedTable} />
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setFile(null)} disabled={isImporting}>
                Cancel
              </Button>
              <Button 
                onClick={() => setShowMapping(true)} 
                className="flex items-center gap-2"
              >
                <Settings2 className="h-4 w-4" />
                Configure Mapping
              </Button>
            </div>
          </>
        )}

        {showMapping && (
          <ColumnMappingStep
            excelColumns={getExcelColumns()}
            dbColumns={TABLE_SCHEMAS[selectedTable] || []}
            mapping={columnMapping}
            onMappingChange={(excelCol, dbCol) => {
              setColumnMapping({ ...columnMapping, [excelCol]: dbCol });
            }}
            onConfirm={handleMappingConfirm}
            onCancel={() => setShowMapping(false)}
          />
        )}

        {mappedData && mappedData.length > 0 && !showMapping && (
          <>
            <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
              <h4 className="font-semibold text-sm">Validation Status</h4>
              {(() => {
                const validation = validateMappedData(selectedTable);
                const requiredCols = TABLE_SCHEMAS[selectedTable]?.map(col => col.name) || [];
                const mappedDbCols = Object.values(columnMapping).filter(col => col !== null);
                
                return (
                  <div className="space-y-2">
                    {requiredCols.map(reqCol => {
                      const isMapped = mappedDbCols.includes(reqCol);
                      return (
                        <div key={reqCol} className="flex items-center gap-2 text-sm">
                          {isMapped ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-destructive">✗</span>
                          )}
                          <span className={isMapped ? "text-muted-foreground" : "text-destructive"}>
                            {reqCol}
                          </span>
                        </div>
                      );
                    })}
                    {!validation.valid && (
                      <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                        <strong>Validation failed:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {validation.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <DataPreview data={mappedData} tableName={selectedTable} />
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setFile(null)} disabled={isImporting}>
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowMapping(true)} 
                className="flex items-center gap-2"
              >
                <Settings2 className="h-4 w-4" />
                Edit Mapping
              </Button>
              <Button onClick={handleImport} disabled={isImporting} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import {mappedData.length} Records
              </Button>
            </div>
          </>
        )}

        {isImporting && <ImportProgress progress={importProgress} />}
      </div>
    </div>
  );
}
