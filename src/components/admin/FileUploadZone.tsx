import { useCallback } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export function FileUploadZone({ file, onFileSelect }: FileUploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))) {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  if (file) {
    return (
      <div className="border rounded-lg p-6 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={() => onFileSelect(null)}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={cn(
        "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
        "hover:border-primary/50 hover:bg-muted/30 cursor-pointer"
      )}
    >
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Drop your Excel file here</p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse (.xlsx, .xls)
        </p>
        <p className="text-xs text-muted-foreground">
          Maximum file size: 10MB
        </p>
      </label>
    </div>
  );
}
