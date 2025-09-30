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

// Required columns per table (non-nullable columns)
const REQUIRED_COLUMNS: Record<string, string[]> = {
  staffing_standards: ["market", "facilityId", "facilityName", "departmentId", "departmentName"],
  labor_performance: ["market", "facilityId", "facilityName", "departmentId", "departmentName"],
  positions: ["market", "facilityId", "facilityName", "departmentId", "departmentName"],
  markets: ["market"],
  facilities: ["market", "facility_id", "facility_name"],
  departments: ["facility_id", "department_id", "department_name"],
};

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

  const isExcelSerialDate = (value: any): boolean => {
    return typeof value === "number" && value > 1000 && value < 100000;
  };

  const excelSerialToDate = (serial: number): Date => {
    // Excel serial dates start from 1900-01-01 (but Excel incorrectly treats 1900 as leap year)
    const epoch = new Date(1899, 11, 30); // Dec 30, 1899
    return new Date(epoch.getTime() + serial * 86400000);
  };

  const transformDataValue = (value: any, dbColumn: string): any => {
    // Handle null, undefined, empty strings, and whitespace-only strings
    if (
      value === null ||
      value === undefined ||
      value === "null" ||
      value === "NULL" ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return null;
    }

    // Handle month column - convert various formats to ISO timestamp
    if (dbColumn === "month") {
      // Excel serial date
      if (isExcelSerialDate(value)) {
        const date = excelSerialToDate(value);
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1)).toISOString();
      }
      
      // String formats
      if (typeof value === "string") {
        const trimmed = value.trim();
        
        // YYYY-MM format
        if (/^\d{4}-\d{2}$/.test(trimmed)) {
          return `${trimmed}-01T00:00:00Z`;
        }
        
        // YYYY/MM format
        if (/^\d{4}\/\d{2}$/.test(trimmed)) {
          const [year, month] = trimmed.split("/");
          return `${year}-${month}-01T00:00:00Z`;
        }
        
        // MM/YYYY format
        if (/^\d{2}\/\d{4}$/.test(trimmed)) {
          const [month, year] = trimmed.split("/");
          return `${year}-${month}-01T00:00:00Z`;
        }
        
        // YYYYMM format
        if (/^\d{6}$/.test(trimmed)) {
          const year = trimmed.substring(0, 4);
          const month = trimmed.substring(4, 6);
          return `${year}-${month}-01T00:00:00Z`;
        }
      }
      
      // Date object
      if (value instanceof Date) {
        return new Date(Date.UTC(value.getFullYear(), value.getMonth(), 1)).toISOString();
      }
    }

    // Handle positionStatusDate column - convert to YYYY-MM-DD
    if (dbColumn === "positionStatusDate") {
      // Excel serial date
      if (isExcelSerialDate(value)) {
        const date = excelSerialToDate(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      
      // String date formats
      if (typeof value === "string") {
        const trimmed = value.trim();
        // YYYY-MM-DD already
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          return trimmed;
        }
      }
      
      // Date object
      if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    }

    // Handle numeric columns - safely parse strings
    const numericColumns = [
      "volume", "manhours", "laborHoursPerUoS", "actual_fte",
      "FTE", "standardHours", "Patients"
    ];
    
    if (numericColumns.includes(dbColumn)) {
      if (value === null || value === undefined) return null;
      
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "") return null;
        const num = parseFloat(trimmed);
        return isNaN(num) ? null : num;
      }
      
      if (typeof value === "number") {
        return isNaN(value) ? null : value;
      }
      
      return null;
    }

    // Return as-is for other columns
    return value;
  };

  const validateMappedData = (tableName: TableName): { valid: boolean; errors: string[] } => {
    const requiredCols = REQUIRED_COLUMNS[tableName] || [];
    const errors: string[] = [];

    // Check if all required columns are mapped
    const mappedDbColumns = Object.values(columnMapping).filter(col => col !== null);
    const missingRequired = requiredCols.filter(reqCol => !mappedDbColumns.includes(reqCol));
    
    if (missingRequired.length > 0) {
      errors.push(`Missing required columns: ${missingRequired.join(", ")}`);
    }

    // Check if mapped data has non-empty values for required columns
    if (mappedData && mappedData.length > 0) {
      const sampleSize = Math.min(5, mappedData.length);
      const samples = mappedData.slice(0, sampleSize);
      
      requiredCols.forEach(reqCol => {
        const hasEmptyValues = samples.some(row => {
          const value = row[reqCol];
          return value === null || value === undefined || value === "";
        });
        
        if (hasEmptyValues) {
          errors.push(`Required column "${reqCol}" contains empty values`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
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

    // Validate before importing
    const validation = validateMappedData(tableName);
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error));
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
    let lastError: any = null;
    const failingRows: string[] = [];

    try {
      for (let i = 0; i < dataToImport.length; i += batchSize) {
        const batch = dataToImport.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from(tableName as any)
          .insert(batch as any);

        if (error) {
          console.error("Batch import error:", error);
          lastError = error;
          
          // Try to find which specific rows failed
          let batchFailed = 0;
          for (let j = 0; j < batch.length && failingRows.length < 3; j++) {
            const singleRow = [batch[j]];
            const { error: rowError } = await supabase
              .from(tableName as any)
              .insert(singleRow as any);
            
            if (rowError) {
              batchFailed++;
              const rowIndex = i + j + 1; // 1-indexed for user display
              const rowPreview = JSON.stringify(batch[j]).substring(0, 100);
              failingRows.push(`Row ${rowIndex}: ${rowError.message} | Data: ${rowPreview}...`);
            } else {
              imported++;
            }
          }
          
          // If we didn't test all rows individually (after first 3 failures), count remaining as failed
          if (batchFailed > 0 && failingRows.length >= 3) {
            failed += batch.length - Math.min(3, batch.length);
          } else {
            failed += batchFailed;
          }
          
          // Show detailed error for first batch failure
          if (failingRows.length > 0 && failingRows.length <= 3) {
            const errorMsg = error.message || "Unknown error";
            toast.error(`Import error: ${errorMsg}`, { duration: 10000 });
            failingRows.forEach(row => toast.error(row, { duration: 12000 }));
          }
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
        status: failed > 0 ? "error" : "complete",
      });

      if (failed === 0) {
        toast.success(`Successfully imported ${imported} records`);
      } else {
        toast.warning(`Imported ${imported} records, ${failed} failed`);
      }

      setIsImporting(false);
      return failed === 0;
    } catch (error) {
      console.error("Import error:", error);
      setImportProgress({
        total: dataToImport.length,
        imported,
        failed: dataToImport.length - imported,
        status: "error",
      });
      toast.error(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
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
    validateMappedData,
    isImporting,
    importProgress,
    importData,
    downloadTemplate,
  };
}
