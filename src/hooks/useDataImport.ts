import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database['public']['Tables'];

interface ImportProgress {
  total: number;
  imported: number;
  failed: number;
  status: "idle" | "importing" | "complete" | "error";
}

interface ColumnMapping {
  [excelColumn: string]: string | null; // maps to db column name or null if skipped
}

export function useDataImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [mappedData, setMappedData] = useState<any[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    total: 0,
    imported: 0,
    failed: 0,
    status: "idle",
  });

  useEffect(() => {
    if (file) {
      parseExcelFile(file);
    } else {
      setParsedData(null);
      setColumnMapping({});
      setMappedData(null);
    }
  }, [file]);

  const parseExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setParsedData(jsonData);
      
      // Auto-detect column mapping
      if (jsonData.length > 0) {
        const excelColumns = Object.keys(jsonData[0]);
        const autoMapping = autoDetectMapping(excelColumns);
        setColumnMapping(autoMapping);
      }
      
      toast.success(`Parsed ${jsonData.length} records from Excel file`);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast.error("Failed to parse Excel file");
      setParsedData(null);
    }
  };

  const autoDetectMapping = (excelColumns: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {};
    
    excelColumns.forEach(excelCol => {
      // Try exact match (case-insensitive)
      const normalized = excelCol.toLowerCase().trim();
      mapping[excelCol] = normalized;
      
      // Handle common variations
      if (normalized === 'facilityid') mapping[excelCol] = 'facilityId';
      if (normalized === 'departmentid') mapping[excelCol] = 'departmentId';
      if (normalized === 'facilityname') mapping[excelCol] = 'facilityName';
      if (normalized === 'departmentname') mapping[excelCol] = 'departmentName';
      if (normalized === 'laborhoursperuos') mapping[excelCol] = 'laborHoursPerUoS';
    });
    
    return mapping;
  };

  const transformDataValue = (value: any, dbColumn: string): any => {
    // Handle null strings
    if (value === "null" || value === "NULL" || value === "") {
      return null;
    }

    // Handle month column - convert "2022-04" to ISO timestamp
    if (dbColumn === "month" && typeof value === "string") {
      if (/^\d{4}-\d{2}$/.test(value)) {
        // "2022-04" -> "2022-04-01T00:00:00Z"
        return `${value}-01T00:00:00Z`;
      }
    }

    // Handle numeric columns
    const numericColumns = [
      "volume", "manhours", "laborHoursPerUoS", "actual_fte",
      "FTE", "standardHours", "Patients"
    ];
    
    if (numericColumns.includes(dbColumn)) {
      if (value === null || value === undefined) return null;
      const num = typeof value === "string" ? parseFloat(value) : value;
      return isNaN(num) ? null : num;
    }

    return value;
  };

  const applyMapping = () => {
    if (!parsedData || parsedData.length === 0) {
      toast.error("No data to map");
      return;
    }

    try {
      const transformed = parsedData.map((row) => {
        const newRow: any = {};
        
        Object.entries(columnMapping).forEach(([excelCol, dbCol]) => {
          if (dbCol && row[excelCol] !== undefined) {
            const transformedValue = transformDataValue(row[excelCol], dbCol);
            newRow[dbCol] = transformedValue;
          }
        });
        
        return newRow;
      });

      setMappedData(transformed);
      toast.success(`Mapped ${transformed.length} records`);
    } catch (error) {
      console.error("Mapping error:", error);
      toast.error("Failed to map data");
    }
  };

  const importData = async (tableName: TableName): Promise<boolean> => {
    const dataToImport = mappedData || parsedData;
    
    if (!dataToImport || dataToImport.length === 0) {
      return false;
    }

    setIsImporting(true);
    setImportProgress({
      total: dataToImport.length,
      imported: 0,
      failed: 0,
      status: "importing",
    });

    const batchSize = 100;
    let imported = 0;
    let failed = 0;

    try {
      for (let i = 0; i < dataToImport.length; i += batchSize) {
        const batch = dataToImport.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from(tableName as any)
          .insert(batch as any);

        if (error) {
          console.error("Batch import error:", error);
          failed += batch.length;
        } else {
          imported += batch.length;
        }

        setImportProgress({
          total: dataToImport.length,
          imported,
          failed,
          status: "importing",
        });
      }

      setImportProgress({
        total: dataToImport.length,
        imported,
        failed,
        status: "complete",
      });

      if (failed === 0) {
        toast.success(`Successfully imported ${imported} records`);
      } else {
        toast.warning(`Imported ${imported} records, ${failed} failed`);
      }

      setIsImporting(false);
      return true;
    } catch (error) {
      console.error("Import error:", error);
      setImportProgress({
        total: dataToImport.length,
        imported,
        failed,
        status: "error",
      });
      toast.error("Import failed");
      setIsImporting(false);
      return false;
    }
  };

  const downloadTemplate = (tableName: string) => {
    const templates: Record<string, string[][]> = {
      staffing_standards: [
        ["market", "facilityId", "facilityName", "departmentId", "departmentName", "Patients", "CL-Day", "RN-Day", "PCT-Day", "Clerk-Day", "CL-Night", "RN-Night", "PCT-Night", "Clerk-Night", "Frequency", "% Census", "CL Day total hours", "RN Day total hours", "PCT Day total hours", "Clerk Day total hours", "CL Night total hours", "RN Night total hours", "PCT Night total hours", "Clerk Night total hours", "Variable Hrs Per UoS", "Fixed Hrs Per UoS", "CL : PT", "RN : PT", "Director", "Manager", "ANM", "Practice Specialist", "Ops Coordinator", "1:1 / Other", "Total Overhead Hours", "Column1", "Column2", "Column3"],
      ],
      labor_performance: [
        ["market", "facilityId", "facilityName", "departmentId", "departmentName", "volume", "manhours", "laborHoursPerUoS", "month", "actual_fte"],
      ],
      positions: [
        ["positionLifecycle", "employmentFlag", "positionStatus", "positionStatusDate", "market", "positionNum", "facilityId", "facilityName", "departmentId", "departmentName", "employeeType", "employmentType", "shift", "jobcode", "jobFamily", "jobTitle", "FTE", "standardHours", "payrollStatus", "employeeName", "employeeId", "managerPositionNum", "managerEmployeeId", "managerName"],
      ],
      markets: [
        ["market"],
      ],
      facilities: [
        ["market", "facility_id", "facility_name"],
      ],
      departments: [
        ["facility_id", "department_id", "department_name"],
      ],
    };

    const templateData = templates[tableName] || [["No template available"]];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${tableName}_template.xlsx`);
    toast.success("Template downloaded");
  };

  return {
    file,
    setFile,
    parsedData,
    columnMapping,
    setColumnMapping,
    mappedData,
    applyMapping,
    isImporting,
    importProgress,
    importData,
    downloadTemplate,
  };
}
