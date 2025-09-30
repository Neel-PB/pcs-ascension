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

export function useDataImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
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
      toast.success(`Parsed ${jsonData.length} records from Excel file`);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast.error("Failed to parse Excel file");
      setParsedData(null);
    }
  };

  const importData = async (tableName: TableName): Promise<boolean> => {
    if (!parsedData || parsedData.length === 0) {
      return false;
    }

    setIsImporting(true);
    setImportProgress({
      total: parsedData.length,
      imported: 0,
      failed: 0,
      status: "importing",
    });

    const batchSize = 100;
    let imported = 0;
    let failed = 0;

    try {
      for (let i = 0; i < parsedData.length; i += batchSize) {
        const batch = parsedData.slice(i, i + batchSize);
        
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
          total: parsedData.length,
          imported,
          failed,
          status: "importing",
        });
      }

      setImportProgress({
        total: parsedData.length,
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
        total: parsedData.length,
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
        ["market", "facility_id", "facility_name", "department_id", "department_name", "patient_days", "admissions", "total_fte", "total_hours"],
      ],
      labor_performance: [
        ["market", "facility_id", "facility_name", "department_id", "department_name", "month", "volume", "manhours", "labor_hours_per_uos", "actual_fte"],
      ],
      positions: [
        ["market", "facility_id", "facility_name", "department_id", "department_name", "employee_id", "employee_name", "job_title", "employment_status"],
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
    isImporting,
    importProgress,
    importData,
    downloadTemplate,
  };
}
