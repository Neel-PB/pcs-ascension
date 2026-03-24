import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";
import { toast } from "sonner";

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

function normalizePosts(raw: any): Post[] {
  const items = Array.isArray(raw) ? raw : raw?.data ?? [];
  return items.map((post: any) => ({
    id: post.id,
    user_id: post.user_id || post.userId,
    content: post.content,
    post_type: post.post_type || post.postType || 'general',
    attachments: post.attachments || [],
    created_at: post.created_at || post.createdAt,
    updated_at: post.updated_at || post.updatedAt,
    author: post.author || { first_name: 'Unknown', last_name: 'User', avatar_url: undefined },
    likes: post.likes || [],
    comments: (post.comments || []).map((c: any) => ({
      id: c.id,
      post_id: c.post_id || c.postId,
      user_id: c.user_id || c.userId,
      content: c.content,
      created_at: c.created_at || c.createdAt,
      author: c.author || { first_name: 'Unknown', last_name: 'User', avatar_url: undefined },
    })),
  }));
}

export function useEmployeeFeed() {
  return useQuery({
    queryKey: ["employee-feed"],
    queryFn: async () => {
      const raw = await apiFetch("/feed");
      return normalizePosts(raw);
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, post_type, attachments }: {
      content: string;
      post_type: string;
      attachments?: string[];
    }) => {
      return apiFetch("/feed", {
        method: "POST",
        body: JSON.stringify({ content, post_type, attachments: attachments || [] }),
      });
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

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      return apiFetch(`/feed/${postId}/like`, {
        method: isLiked ? "DELETE" : "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-feed"] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      return apiFetch(`/feed/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
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
      return apiFetch(`/feed/${postId}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      });
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
      return apiFetch(`/feed/posts/${postId}`, {
        method: "DELETE",
      });
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

export async function uploadFeedAttachment(file: File | Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, fileName);

  const token = sessionStorage.getItem("nestjs_token");
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

  const res = await fetch(`${API_BASE_URL}/feed/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Upload failed");
  }

  const data = await res.json();
  return data.url || data.publicUrl;
}
