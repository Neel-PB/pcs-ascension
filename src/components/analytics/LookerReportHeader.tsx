import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Share2, Filter, Calendar } from "@/lib/icons";
import { ICON_CHROME } from "@/lib/iconSizes";
import { cn } from "@/lib/utils";

interface LookerReportHeaderProps {
  title: string;
  description?: string;
}

export const LookerReportHeader = ({ title, description }: LookerReportHeaderProps) => {
  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <RefreshCw className={cn(ICON_CHROME, "mr-2")} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm">
            <Download className={cn(ICON_CHROME, "mr-2")} />
            Export
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className={cn(ICON_CHROME, "mr-2")} />
            Share
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4 px-6 py-3 bg-muted/30">
        <Button variant="outline" size="sm">
          <Calendar className={cn(ICON_CHROME, "mr-2")} />
          Last 30 Days
        </Button>
        <Button variant="outline" size="sm">
          <Filter className={cn(ICON_CHROME, "mr-2")} />
          All Regions
        </Button>
        <div className="ml-auto">
          <span className="text-xs text-muted-foreground bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
            DEMO MODE
          </span>
        </div>
      </div>
    </div>
  );
};
