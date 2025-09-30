import { useState } from "react";
import { FileUploadZone } from "@/components/admin/FileUploadZone";
import { DataPreview } from "@/components/admin/DataPreview";
import { ImportProgress } from "@/components/admin/ImportProgress";
import { useDataImport } from "@/hooks/useDataImport";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database['public']['Tables'];

export default function DataImportPage() {
  const [selectedTable, setSelectedTable] = useState<TableName>("staffing_standards");
  const {
    file,
    setFile,
    parsedData,
    isImporting,
    importProgress,
    importData,
    downloadTemplate,
  } = useDataImport();

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) {
      toast.error("No data to import");
      return;
    }

    const success = await importData(selectedTable);
    if (success) {
      setFile(null);
    }
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

        {parsedData && parsedData.length > 0 && (
          <>
            <DataPreview data={parsedData} tableName={selectedTable} />
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setFile(null)} disabled={isImporting}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isImporting} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import {parsedData.length} Records
              </Button>
            </div>
          </>
        )}

        {isImporting && <ImportProgress progress={importProgress} />}
      </div>
    </div>
  );
}
