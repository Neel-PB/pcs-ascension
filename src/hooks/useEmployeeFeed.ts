import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface PostAuthor {
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: PostAuthor;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  post_type: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
  author: PostAuthor;
  likes: string[];
  comments: Comment[];
}

export function useEmployeeFeed() {
  return useQuery({
    queryKey: ["employee-feed"],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_user_id_fkey(first_name, last_name, avatar_url),
          post_likes(user_id),
          comments(
            id,
            post_id,
            user_id,
            content,
            created_at,
            author:profiles!comments_user_id_fkey(first_name, last_name, avatar_url)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return posts.map((post: any) => ({
        ...post,
        author: post.author || { first_name: 'Unknown', last_name: 'User', avatar_url: undefined },
        likes: post.post_likes?.map((like: any) => like.user_id) || [],
        comments: (post.comments || []).map((comment: any) => ({
          ...comment,
          author: comment.author || { first_name: 'Unknown', last_name: 'User', avatar_url: undefined },
        })),
      })) as Post[];
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ content, post_type, attachments }: { 
      content: string; 
      post_type: string;
      attachments?: string[];
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content,
          post_type,
          attachments: attachments || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-feed"] });
    },
    onError: (error) => {
      toast.error("Failed to create post");
      console.error(error);
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      if (isLiked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-feed"] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-feed"] });
    },
    onError: (error) => {
      toast.error("Failed to add comment");
      console.error(error);
    },
  });
}

export function useEditPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { error } = await supabase
        .from("posts")
        .update({ content })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-feed"] });
      toast.success("Post updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update post");
      console.error(error);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-feed"] });
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete post");
      console.error(error);
    },
  });
}