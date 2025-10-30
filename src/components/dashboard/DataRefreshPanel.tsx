import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface DataRefreshLog {
  id: string;
  data_source: string;
  last_refresh_at: string;
  refresh_status: string;
  record_count: number | null;
  notes: string | null;
}

const dataSourceConfig: Record<string, {
  label: string;
  description: string;
}> = {
  positions_data: {
    label: "Positions Data",
    description: "Employees, Contractors, and Requisitions",
  },
  staffing_grid: {
    label: "Staffing Grid",
    description: "Budget and Target FTE Allocations",
  },
  labor_uos_data: {
    label: "Labor UOS Data",
    description: "Actual Hours and Performance Metrics",
  },
};

export function DataRefreshPanel() {
  const { data: refreshLogs, isLoading } = useQuery({
    queryKey: ["data-refresh-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_refresh_log")
        .select("*")
        .order("last_refresh_at", { ascending: false });

      if (error) throw error;
      return data as DataRefreshLog[];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const getStatusInfo = (lastRefresh: string) => {
    const hoursSinceRefresh = (Date.now() - new Date(lastRefresh).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceRefresh < 12) {
      return { text: "Current", color: "text-green-600 dark:text-green-400" };
    } else if (hoursSinceRefresh < 24) {
      return { text: "Recent", color: "text-blue-600 dark:text-blue-400" };
    } else if (hoursSinceRefresh < 48) {
      return { text: "Stale", color: "text-yellow-600 dark:text-yellow-400" };
    } else {
      return { text: "Critical", color: "text-red-600 dark:text-red-400" };
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Data Last Updated</h3>
      </div>

      <div>
        {refreshLogs?.map((log, index) => {
          const config = dataSourceConfig[log.data_source];
          if (!config) return null;

          const statusInfo = getStatusInfo(log.last_refresh_at);

          return (
            <div key={log.id}>
              <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Left column: Data source info */}
                <div>
                  <p className="text-sm font-medium mb-1">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
                
                {/* Right column: Timestamp and status */}
                <div className="flex flex-col gap-2 md:items-end">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap md:justify-end">
                    <span>
                      {format(new Date(log.last_refresh_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(log.last_refresh_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className={cn("flex items-center gap-1.5 text-xs font-medium", statusInfo.color)}>
                    <span className="text-lg leading-none">●</span>
                    <span>{statusInfo.text}</span>
                  </div>
                </div>
              </div>
              
              {index < (refreshLogs?.length || 0) - 1 && <Separator />}
            </div>
          );
        })}

        {(!refreshLogs || refreshLogs.length === 0) && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              No refresh data available
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
