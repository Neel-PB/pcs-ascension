import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMessageHistory, roleGroups } from "@/hooks/useMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DOMPurify from "dompurify";

export function MessageHistory() {
  const { data: messages, isLoading } = useMessageHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Feed History</h3>
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
    <div className="bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Feed History</h3>
      </div>

      {!messages || messages.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No feed posts yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-lg p-4 hover:bg-accent/30 hover:border-border/60 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
                    <h4 className="font-semibold truncate">{msg.title}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-muted-foreground">To:</span>
                    {msg.target_roles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs h-5">
                        {getRoleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(msg.sent_at), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                  className="h-7 w-7 p-0 rounded-lg hover:bg-accent flex-shrink-0"
                >
                  {expandedId === msg.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {expandedId === msg.id && (
                <div className="mt-4 pt-4 border-t border-border/40 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                  <div 
                    className="text-sm prose prose-sm max-w-none text-foreground/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.message) }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
