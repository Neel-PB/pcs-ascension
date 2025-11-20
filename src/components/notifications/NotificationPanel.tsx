import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetFooter 
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { Bell, Check, MessageCircle, Heart, Users, Megaphone, MessageSquare, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  mention: Users,
  announcement: Megaphone,
  message: MessageSquare,
  default: Bell,
};

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const [activeTab, setActiveTab] = useState("alerts");

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg [&>button]:hidden p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="alerts" className="gap-2">
                Alerts
                {unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
          </Tabs>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsContent value="feed" className="flex-1 m-0">
            <ScrollArea className="h-full px-6">
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Feed updates coming soon
                </p>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="alerts" className="flex-1 m-0">
            {isLoading ? (
              <div className="flex-1 px-6 py-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-full px-6">
                {!notifications || notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    {notifications.map((notification) => {
                      const IconComponent = notificationIcons[notification.type as keyof typeof notificationIcons] || notificationIcons.default;
                      
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 rounded-lg border transition-colors cursor-pointer hover:bg-accent/50",
                            !notification.read && "bg-primary/5 border-primary/20"
                          )}
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead.mutate(notification.id);
                            }
                            if (notification.link) {
                              window.location.href = notification.link;
                            }
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                              notification.type === 'like' && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                              notification.type === 'comment' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                              notification.type === 'mention' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                              notification.type === 'announcement' && "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                              notification.type === 'message' && "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                              !['like', 'comment', 'mention', 'announcement', 'message'].includes(notification.type) && "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
                            )}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-sm font-semibold line-clamp-1">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(notification.created_at), 'd MMM • HH:mm')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="actions" className="flex-1 m-0">
            <ScrollArea className="h-full px-6">
              <div className="text-center py-12">
                <Check className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Action items coming soon
                </p>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <SheetFooter className="px-6 py-4 border-t flex-row justify-between gap-2">
          {activeTab === "alerts" && unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark as Read
            </Button>
          )}
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            className="ml-auto"
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
