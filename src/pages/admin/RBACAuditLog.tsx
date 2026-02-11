import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Filter, RefreshCw, User } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useRBACAuditLog,
  formatActionType,
  formatTargetType,
  type AuditLogEntry,
} from "@/hooks/useRBACAuditLog";
import { cn } from "@/lib/utils";

function ActionBadge({ actionType }: { actionType: string }) {
  const variant = actionType.includes("deleted") || actionType.includes("revoked")
    ? "destructive"
    : actionType.includes("created") || actionType.includes("granted")
    ? "default"
    : "secondary";

  return (
    <Badge variant={variant} className="text-xs">
      {formatActionType(actionType)}
    </Badge>
  );
}

function ActorDisplay({ entry }: { entry: AuditLogEntry }) {
  if (!entry.actor_id) {
    return <span className="text-muted-foreground text-sm">System</span>;
  }

  const name = entry.actor_profile
    ? `${entry.actor_profile.first_name || ""} ${entry.actor_profile.last_name || ""}`.trim()
    : null;

  return (
    <div className="flex items-center gap-2">
      <User className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-sm">
        {name || entry.actor_profile?.email || "Unknown User"}
      </span>
    </div>
  );
}

function JsonDiff({ label, data }: { label: string; data: unknown | null }) {
  if (!data) return null;

  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto max-h-40">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function AuditLogRow({ entry }: { entry: AuditLogEntry }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasDetails = entry.old_value || entry.new_value;

  return (
    <>
      <TableRow 
        className={cn(hasDetails && "cursor-pointer hover:bg-muted/50")}
        onClick={() => hasDetails && setIsOpen(!isOpen)}
      >
        <TableCell className="w-10">
          {hasDetails && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(entry.created_at), "MMM d, yyyy HH:mm:ss")}
        </TableCell>
        <TableCell>
          <ActionBadge actionType={entry.action_type} />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs shrink-0">
              {formatTargetType(entry.target_type)}
            </Badge>
            <span className="text-sm font-mono truncate">{entry.target_name}</span>
          </div>
        </TableCell>
        <TableCell>
          <ActorDisplay entry={entry} />
        </TableCell>
      </TableRow>
      {hasDetails && isOpen && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={5} className="py-3">
            <div className="grid grid-cols-2 gap-4 pl-10">
              <JsonDiff label="Previous Value" data={entry.old_value} />
              <JsonDiff label="New Value" data={entry.new_value} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function RBACAuditLog() {
  // Radix Select forbids SelectItem values of "" (empty string).
  // Use a non-empty sentinel for the "All" option.
  const ALL = "all" as const;
  const [actionFilter, setActionFilter] = useState<string>(ALL);
  const [targetFilter, setTargetFilter] = useState<string>(ALL);

  const { data: auditLogs, isLoading, refetch, isRefetching } = useRBACAuditLog({
    actionType: actionFilter === ALL ? undefined : actionFilter,
    targetType: targetFilter === ALL ? undefined : targetFilter,
    limit: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Permission Audit Log</h3>
          <p className="text-sm text-muted-foreground">
            Track all changes to roles and permissions with timestamps and actor details.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Actions</SelectItem>
            <SelectItem value="role_created">Role Created</SelectItem>
            <SelectItem value="role_updated">Role Updated</SelectItem>
            <SelectItem value="role_deleted">Role Deleted</SelectItem>
            <SelectItem value="permission_created">Permission Created</SelectItem>
            <SelectItem value="permission_updated">Permission Updated</SelectItem>
            <SelectItem value="permission_deleted">Permission Deleted</SelectItem>
            <SelectItem value="permission_granted">Permission Granted</SelectItem>
            <SelectItem value="permission_revoked">Permission Revoked</SelectItem>
            <SelectItem value="permission_changed">Permission Changed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={targetFilter} onValueChange={setTargetFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Targets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Targets</SelectItem>
            <SelectItem value="roles">Roles</SelectItem>
            <SelectItem value="permissions">Permissions</SelectItem>
            <SelectItem value="role_permissions">Role Permissions</SelectItem>
          </SelectContent>
        </Select>

        {(actionFilter !== ALL || targetFilter !== ALL) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActionFilter(ALL);
              setTargetFilter(ALL);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-48">Timestamp</TableHead>
              <TableHead className="w-40">Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead className="w-48">Changed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                </TableRow>
              ))
            ) : auditLogs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No audit log entries found.
                </TableCell>
              </TableRow>
            ) : (
              auditLogs?.map((entry) => (
                <AuditLogRow key={entry.id} entry={entry} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {auditLogs && auditLogs.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {auditLogs.length} entries
        </p>
      )}
    </div>
  );
}
