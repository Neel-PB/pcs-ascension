import { Badge } from "@/components/ui/badge";

export function InboxBadge() {
  // Placeholder implementation - in real app, this would fetch actual unread count
  const unreadCount = 0;

  if (unreadCount === 0) return null;

  return (
    <Badge variant="destructive" className="text-xs px-1.5 py-0 ml-auto">
      {unreadCount}
    </Badge>
  );
}
