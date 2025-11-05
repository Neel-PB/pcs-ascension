import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMessageHistory, roleGroups } from "@/hooks/useMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function MessageHistory() {
  const { data: messages, isLoading } = useMessageHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Message History</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const getRoleLabel = (roleValue: string) => {
    return roleGroups.find((r) => r.value === roleValue)?.label || roleValue;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-xl font-semibold">Message History</h3>
      </div>

      {!messages || messages.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No messages sent yet
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{msg.title}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">To:</span>
                    {msg.target_roles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {getRoleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sent {formatDistanceToNow(new Date(msg.sent_at), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                >
                  {expandedId === msg.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {expandedId === msg.id && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
