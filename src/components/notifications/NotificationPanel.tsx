import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetFooter 
} from "@/components/ui/sheet";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AttachmentDisplay } from "@/components/feed/AttachmentDisplay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { useEmployeeFeed } from "@/hooks/useEmployeeFeed";
import { MonthlyVolumeChecklist } from "@/components/notifications/VolumeOverrideChecklist";
import { Bell, Check, MessageCircle, Heart, Users, Megaphone, MessageSquare, X } from "@/lib/icons";
import { format, formatDistanceToNow } from "date-fns";
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
  const { data: posts, isLoading: isLoadingPosts } = useEmployeeFeed();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const [activeTab, setActiveTab] = useState("feed");

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg [&>button]:hidden p-0 flex flex-col">
        <SheetHeader className="flex-shrink-0 px-6 py-4 border-b">
          <ToggleButtonGroup
            items={[
              { id: "feed", label: "Feed" },
              { id: "alerts", label: unreadCount > 0 ? `Alerts (${unreadCount})` : "Alerts" },
              { id: "actions", label: "Actions" },
            ]}
            activeId={activeTab}
            onSelect={setActiveTab}
            layoutId="notificationPanelToggle"
          />
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsContent value="feed" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-6">
              {isLoadingPosts ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-32" />
                          <div className="h-3 bg-muted rounded w-24" />
                        </div>
                      </div>
                      <div className="h-16 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-4 py-4">
                  {posts.map((post) => (
                    <div 
                      key={post.id}
                      className="border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => {
                        onOpenChange(false);
                        window.location.href = '/';
                      }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.author?.avatar_url || ''} />
                          <AvatarFallback>
                            {post.author?.first_name?.[0]}{post.author?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {post.author?.first_name || 'Unknown'} {post.author?.last_name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      <div 
                        className="text-sm prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />

                      {post.attachments && post.attachments.length > 0 && (
                        <AttachmentDisplay attachments={post.attachments} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No feed posts yet
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="alerts" className="flex-1 overflow-hidden">
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

          <TabsContent value="actions" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-6">
              <MonthlyVolumeChecklist />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <SheetFooter className="flex-shrink-0 px-6 py-3 border-t flex-row justify-between gap-2">
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
