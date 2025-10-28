import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database, Users, TrendingUp, Building2, ActivitySquare, RefreshCw, Clock } from "lucide-react";
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
  icon: typeof Users;
  color: string;
}> = {
  positions: {
    label: "Workforce Positions",
    description: "Employees, Contractors, and Requisitions",
    icon: Users,
    color: "blue",
  },
  staffing_standards: {
    label: "Staffing Standards",
    description: "Budget and Target FTE Allocations",
    icon: TrendingUp,
    color: "green",
  },
  labor_performance: {
    label: "Labor Performance",
    description: "Actual Hours and Performance Metrics",
    icon: ActivitySquare,
    color: "purple",
  },
  organizational_structure: {
    label: "Organizational Structure",
    description: "Facilities, Markets, Departments, Regions",
    icon: Building2,
    color: "orange",
  },
  employee_activity: {
    label: "Employee Activity",
    description: "Posts and Comments Feed",
    icon: Database,
    color: "pink",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-success/10 text-success border-success/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "error":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const isStale = (lastRefresh: string) => {
    const hoursSinceRefresh = (Date.now() - new Date(lastRefresh).getTime()) / (1000 * 60 * 60);
    return hoursSinceRefresh > 24; // Consider stale if older than 24 hours
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Data Refresh Status</h3>
            <p className="text-xs text-muted-foreground">Last updated timestamps for all data sources</p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Live
        </Badge>
      </div>

      <div className="space-y-3">
        {refreshLogs?.map((log) => {
          const config = dataSourceConfig[log.data_source];
          if (!config) return null;

          const IconComponent = config.icon;
          const stale = isStale(log.last_refresh_at);

          return (
            <div
              key={log.id}
              className={cn(
                "p-4 rounded-lg border transition-all hover:shadow-sm",
                stale && "border-warning/50 bg-warning/5"
              )}
            >
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-semibold">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                    <Badge className={getStatusColor(log.refresh_status)}>
                      {log.refresh_status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs flex-wrap">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">
                        {format(new Date(log.last_refresh_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      ({formatDistanceToNow(new Date(log.last_refresh_at), { addSuffix: true })})
                    </span>
                    {log.record_count && (
                      <span className="text-muted-foreground">
                        {log.record_count.toLocaleString()} records
                      </span>
                    )}
                  </div>

                  {stale && (
                    <p className="text-xs text-warning mt-2 flex items-center gap-1 font-medium">
                      <span>⚠️ Data may be stale</span>
                      <span className="text-muted-foreground font-normal">(not refreshed in 24+ hours)</span>
                    </p>
                  )}

                  {log.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {log.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {(!refreshLogs || refreshLogs.length === 0) && (
          <div className="text-center py-12">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No refresh logs available
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
