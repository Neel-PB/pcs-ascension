import { RefreshCw } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface DataRefreshLog {
  id: string;
  data_source: string;
  last_refresh_at: string;
  record_count: number | null;
  refresh_status: string;
}

interface DataRefreshButtonProps {
  dataSources: string[];
  compact?: boolean;
  className?: string;
}

const dataSourceConfig: Record<string, string> = {
  positions_data: "Positions Data",
  staffing_grid: "Staffing Grid",
  labor_uos_data: "Labor UOS Data",
  forecast_data: "Forecast Data",
};

export function DataRefreshButton({ dataSources, compact = true, className }: DataRefreshButtonProps) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["data-refresh-status", dataSources],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_refresh_log")
        .select("*")
        .in("data_source", dataSources)
        .order("last_refresh_at", { ascending: false });

      if (error) throw error;
      return data as DataRefreshLog[];
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const getOverallStatus = () => {
    if (logs.length === 0) return "unknown";
    
    let worstStatus = "current"; // green
    
    logs.forEach((log) => {
      const hoursSince = (Date.now() - new Date(log.last_refresh_at).getTime()) / (1000 * 60 * 60);
      if (hoursSince > 48) {
        worstStatus = "critical"; // red
      } else if (hoursSince > 12 && worstStatus !== "critical") {
        worstStatus = "stale"; // yellow
      }
    });
    
    return worstStatus;
  };

  const getStatusInfo = (lastRefresh: string) => {
    const hoursSince = (Date.now() - new Date(lastRefresh).getTime()) / (1000 * 60 * 60);
    
    if (hoursSince > 48) {
      return { text: "Needs Update", color: "bg-red-500" };
    }
    if (hoursSince > 12) {
      return { text: "Stale", color: "bg-yellow-500" };
    }
    return { text: "Current", color: "bg-green-500" };
  };

  const overallStatus = getOverallStatus();
  const statusDotColor = 
    overallStatus === "critical" ? "bg-red-500" : 
    overallStatus === "stale" ? "bg-yellow-500" : 
    overallStatus === "current" ? "bg-green-500" : 
    "bg-muted";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ascension"
          size="icon"
          className={cn("relative", className)}
          aria-label="Data refresh status"
          title="Data refresh status"
        >
          <RefreshCw className="h-4 w-4" />
          <span className={cn(
            "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
            statusDotColor
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Data Last Updated</h4>
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No refresh data available</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const statusInfo = getStatusInfo(log.last_refresh_at);
                return (
                  <div key={log.id} className="flex items-start gap-2">
                    <div className={cn("h-2 w-2 rounded-full mt-1.5 flex-shrink-0", statusInfo.color)} />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm font-medium">
                        {dataSourceConfig[log.data_source] || log.data_source}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.last_refresh_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.last_refresh_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
