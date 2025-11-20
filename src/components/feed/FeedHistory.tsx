import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useEmployeeFeed, useDeletePost } from "@/hooks/useEmployeeFeed";
import { useRBAC } from "@/hooks/useRBAC";
import { AttachmentDisplay } from "./AttachmentDisplay";

export function FeedHistory() {
  const { data: posts, isLoading } = useEmployeeFeed();
  const { mutate: deletePost } = useDeletePost();
  const { hasPermission } = useRBAC();
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const toggleExpanded = (postId: string) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleDeletePost = () => {
    if (postToDelete) {
      deletePost(postToDelete);
      setPostToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading feed posts...</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No feed posts yet.</p>
      </Card>
    );
  }

  return (
    <>
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {posts.map((post) => {
            const isExpanded = expandedPosts.has(post.id);
            const isLongContent = post.content.length > 200;

            return (
              <Card key={post.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar_url || undefined} />
                    <AvatarFallback>
                      {post.author.first_name?.[0]}
                      {post.author.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {post.author.first_name} {post.author.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {hasPermission("admin.access") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPostToDelete(post.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    {isExpanded || !isLongContent ? (
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:mb-2"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    ) : (
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:mb-2"
                        dangerouslySetInnerHTML={{ __html: post.content.slice(0, 200) + '...' }}
                      />
                    )}
                  </div>

                  {isLongContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(post.id)}
                      className="gap-1"
                    >
                      {isExpanded ? (
                        <>
                          Show less <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Show more <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}

                  {post.attachments && post.attachments.length > 0 && (
                    <AttachmentDisplay attachments={post.attachments} />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
