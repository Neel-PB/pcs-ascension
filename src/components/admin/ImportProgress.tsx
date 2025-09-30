import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ImportProgressProps {
  progress: {
    total: number;
    imported: number;
    failed: number;
    status: "idle" | "importing" | "complete" | "error";
  };
}

export function ImportProgress({ progress }: ImportProgressProps) {
  const percentage = progress.total > 0 ? (progress.imported / progress.total) * 100 : 0;

  return (
    <div className="space-y-4 border rounded-lg p-6 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {progress.status === "importing" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {progress.status === "complete" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {progress.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
          <h4 className="font-semibold">
            {progress.status === "importing" && "Importing..."}
            {progress.status === "complete" && "Import Complete"}
            {progress.status === "error" && "Import Failed"}
          </h4>
        </div>
        <span className="text-sm text-muted-foreground">
          {progress.imported} / {progress.total}
        </span>
      </div>

      <Progress value={percentage} className="h-2" />

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Total Records</p>
          <p className="font-semibold">{progress.total}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Imported</p>
          <p className="font-semibold text-green-600">{progress.imported}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Failed</p>
          <p className="font-semibold text-destructive">{progress.failed}</p>
        </div>
      </div>
    </div>
  );
}
