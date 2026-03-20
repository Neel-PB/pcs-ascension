import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeFeed, useCreatePost, useLikePost, useAddComment, useEditPost, useDeletePost } from "@/hooks/useEmployeeFeed";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, 
  MessageCircle, 
  ArrowUp,
  ImagePlus,
  MoreVertical,
  Bold,
  Italic,
  List,
  Underline,
  Loader2,
  X,
  Edit,
  Trash2,
  MessageSquare
} from "@/lib/icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const resolveAvatarUrl = (avatar_url?: string, first_name?: string, last_name?: string) => {
  if (avatar_url) {
    if (avatar_url.startsWith('http')) {
      return avatar_url;
    } else {
      return supabase.storage.from('avatars').getPublicUrl(avatar_url).data.publicUrl;
    }
  }
  const initials = `${first_name?.[0] || ''}${last_name?.[0] || ''}`.toUpperCase();
  return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=6366f1&color=ffffff`;
};

const normalizeEditorLists = (container: HTMLElement) => {
  if (!container) return;
  const ulElements = container.querySelectorAll('ul');
  ulElements.forEach(ul => {
    ul.className = 'list-disc pl-5 my-2';
  });
  const olElements = container.querySelectorAll('ol');
  olElements.forEach(ol => {
    ol.className = 'list-decimal pl-5 my-2';
  });
};

export function UnifiedEmployeeFeed() {
  const [newPostContent, setNewPostContent] = useState('');
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [activeFormatting, setActiveFormatting] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editActiveFormatting, setEditActiveFormatting] = useState<string[]>([]);
  const editEditorRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: posts, isLoading } = useEmployeeFeed();
  const createPostMutation = useCreatePost();
  const likePostMutation = useLikePost();
  const addCommentMutation = useAddComment();
  const editPostMutation = useEditPost();
  const deletePostMutation = useDeletePost();
  const { user } = useAuth();

  const handleCreatePost = async () => {
    const editor = editorRef.current;
    if (!editor || (!editor.innerHTML.trim() && selectedImages.length === 0) || editor.textContent?.trim() === '') {
      toast.error('Please write something or add an image before posting');
      return;
    }

    normalizeEditorLists(editor);

    let attachmentUrls: string[] = [];

    if (selectedImages.length > 0) {
      setUploadingImages(true);
      try {
        for (const image of selectedImages) {
          const fileName = `${user?.id}/${Date.now()}-${image.name}`;
          const { data, error } = await supabase.storage
            .from('post-images')
            .upload(fileName, image);

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('post-images')
            .getPublicUrl(data.path);

          attachmentUrls.push(urlData.publicUrl);
        }
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('Failed to upload images');
        setUploadingImages(false);
        return;
      } finally {
        setUploadingImages(false);
      }
    }

    try {
      await createPostMutation.mutateAsync({
        content: editor.innerHTML,
        post_type: 'general',
        attachments: attachmentUrls
      });

      editor.innerHTML = '';
      setNewPostContent('');
      setSelectedImages([]);
      setActiveFormatting([]);
      toast.success('Post shared successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleLikePost = (postId: string, isLiked: boolean) => {
    likePostMutation.mutate({ postId, isLiked });
  };

  const handleAddComment = (postId: string, content: string) => {
    const text = content.trim();
    if (!text) return;

    addCommentMutation.mutate({ postId, content: text }, {
      onSuccess: () => {
        setNewComments(prev => ({
          ...prev,
          [postId]: ""
        }));
        setShowComments(prev => ({
          ...prev,
          [postId]: true
        }));
      }
    });
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (imageFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...imageFiles]);
    }

    event.target.value = '';
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const applyFormatting = (type: 'bold' | 'italic' | 'underline' | 'list') => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    try {
      switch (type) {
        case 'bold':
          document.execCommand('bold', false, '');
          break;
        case 'italic':
          document.execCommand('italic', false, '');
          break;
        case 'underline':
          document.execCommand('underline', false, '');
          break;
        case 'list':
          document.execCommand('insertUnorderedList', false, '');
          normalizeEditorLists(editor);
          break;
      }

      setNewPostContent(editor.innerHTML);
      updateActiveFormattingState();
    } catch (error) {
      console.error('Error applying formatting:', error);
    }
  };

  const updateActiveFormattingState = () => {
    const active: string[] = [];

    if (document.queryCommandState('bold')) active.push('bold');
    if (document.queryCommandState('italic')) active.push('italic');
    if (document.queryCommandState('underline')) active.push('underline');
    if (document.queryCommandState('insertUnorderedList')) active.push('list');

    setActiveFormatting(active);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreatePost();
    }

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          applyFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormatting('italic');
          break;
        case 'u':
          e.preventDefault();
          applyFormatting('underline');
          break;
      }
    }
  };

  const handleEditorInput = () => {
    const editor = editorRef.current;
    if (!editor) return;

    normalizeEditorLists(editor);
    setNewPostContent(editor.innerHTML);
    updateActiveFormattingState();
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post.id);
    setEditContent(post.content);
    setTimeout(() => {
      if (editEditorRef.current) {
        editEditorRef.current.innerHTML = post.content;
      }
    }, 0);
  };

  const handleSaveEdit = (postId: string) => {
    const editor = editEditorRef.current;
    if (!editor || !editor.innerHTML.trim() || editor.textContent?.trim() === '') return;

    normalizeEditorLists(editor);

    editPostMutation.mutate(
      { postId, content: editor.innerHTML },
      {
        onSuccess: () => {
          setEditingPost(null);
          setEditContent('');
          setEditActiveFormatting([]);
        }
      }
    );
  };

  const applyEditFormatting = (type: 'bold' | 'italic' | 'underline' | 'list') => {
    const editor = editEditorRef.current;
    if (!editor) return;

    editor.focus();

    try {
      switch (type) {
        case 'bold':
          document.execCommand('bold', false, '');
          break;
        case 'italic':
          document.execCommand('italic', false, '');
          break;
        case 'underline':
          document.execCommand('underline', false, '');
          break;
        case 'list':
          document.execCommand('insertUnorderedList', false, '');
          normalizeEditorLists(editor);
          break;
      }

      setEditContent(editor.innerHTML);
      updateEditActiveFormattingState();
    } catch (error) {
      console.error('Error applying formatting:', error);
    }
  };

  const updateEditActiveFormattingState = () => {
    const active: string[] = [];

    if (document.queryCommandState('bold')) active.push('bold');
    if (document.queryCommandState('italic')) active.push('italic');
    if (document.queryCommandState('underline')) active.push('underline');
    if (document.queryCommandState('insertUnorderedList')) active.push('list');

    setEditActiveFormatting(active);
  };

  const handleEditEditorInput = () => {
    const editor = editEditorRef.current;
    if (!editor) return;

    normalizeEditorLists(editor);
    setEditContent(editor.innerHTML);
    updateEditActiveFormattingState();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          applyEditFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          applyEditFormatting('italic');
          break;
        case 'u':
          e.preventDefault();
          applyEditFormatting('underline');
          break;
      }
    }
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleEditorFocus = () => {
    updateActiveFormattingState();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <Skeleton className="h-32 w-full" />
        </Card>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-24 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden shadow-lg">
      {/* Post Creation Area */}
      <div className="p-6 border-b border-border/50">
        {/* Image Preview Section */}
        {selectedImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded-xl"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSelectedImage(index)}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Container with Integrated Utility Bar */}
        <div className="border border-border/60 rounded-2xl overflow-hidden bg-background shadow-sm">
          {/* Content Editable Area */}
          <div 
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onKeyDown={handleKeyDown}
            onFocus={handleEditorFocus}
            className="min-h-[120px] px-4 pt-4 pb-2 text-foreground focus:outline-none prose prose-sm max-w-none"
            data-placeholder="Share an update, announcement, or praise with your team..."
            suppressContentEditableWarning={true}
          />

          {/* Integrated Utility Bar */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-muted/20 border-t border-border/50">
            {/* Left Side - Formatting Tools */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('bold')}
                className={cn(
                  "h-9 w-9 p-0 hover:bg-accent/50",
                  activeFormatting.includes('bold') && "bg-accent text-accent-foreground"
                )}
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('italic')}
                className={cn(
                  "h-9 w-9 p-0 hover:bg-accent/50",
                  activeFormatting.includes('italic') && "bg-accent text-accent-foreground"
                )}
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('underline')}
                className={cn(
                  "h-9 w-9 p-0 hover:bg-accent/50",
                  activeFormatting.includes('underline') && "bg-accent text-accent-foreground"
                )}
                title="Underline (Ctrl+U)"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyFormatting('list')}
                className={cn(
                  "h-9 w-9 p-0 hover:bg-accent/50",
                  activeFormatting.includes('list') && "bg-accent text-accent-foreground"
                )}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageUpload}
                className="h-9 w-9 p-0 hover:bg-accent/50"
                title="Add Image"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={createPostMutation.isPending || uploadingImages}
                size="sm"
                className="h-9 w-9 p-0 rounded-full"
              >
                {(createPostMutation.isPending || uploadingImages) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Posts Section */}
      {!posts || posts.length === 0 ? (
        <div className="p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to share something with your team!
          </p>
        </div>
      ) : (
        posts.map((post, index) => {
          const isLiked = user?.id ? post.likes.includes(user.id) : false;
          const commentsOpen = showComments[post.id] || false;
          const authorAvatarSrc = post.author?.avatar_url;

          return (
            <div key={post.id} className="p-6 border-t border-border/50 bg-card">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={resolveAvatarUrl(authorAvatarSrc, post.author?.first_name, post.author?.last_name)} />
                  <AvatarFallback>
                    {post.author?.first_name?.[0]}{post.author?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base">
                        {post.author?.first_name} {post.author?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(post.created_at), 'd MMM • HH:mm')}
                      </p>
                    </div>
                    {post.user_id === user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/50 -mt-1">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPost(post)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePost(post.id)} 
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-3 ml-[52px]">
                {editingPost === post.id ? (
                  <div className="space-y-3">
                    <div 
                      ref={editEditorRef}
                      contentEditable
                      onInput={handleEditEditorInput}
                      onKeyDown={handleEditKeyDown}
                      className="min-h-[60px] p-3 rounded-lg bg-muted/50 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => applyEditFormatting('bold')}
                          className={cn(
                            "h-7 w-7 p-0",
                            editActiveFormatting.includes('bold') && "bg-accent"
                          )}
                        >
                          <Bold className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => applyEditFormatting('italic')}
                          className={cn(
                            "h-7 w-7 p-0",
                            editActiveFormatting.includes('italic') && "bg-accent"
                          )}
                        >
                          <Italic className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => applyEditFormatting('underline')}
                          className={cn(
                            "h-7 w-7 p-0",
                            editActiveFormatting.includes('underline') && "bg-accent"
                          )}
                        >
                          <Underline className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => applyEditFormatting('list')}
                          className={cn(
                            "h-7 w-7 p-0",
                            editActiveFormatting.includes('list') && "bg-accent"
                          )}
                        >
                          <List className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(post.id)}
                          disabled={editPostMutation.isPending}
                        >
                          {editPostMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingPost(null);
                            setEditActiveFormatting([]);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:mb-2"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                )}
              </div>

              {post.attachments && post.attachments.length > 0 && (
                <div className={cn(
                  "mb-4 ml-[52px] grid gap-2",
                  post.attachments.length === 1 && "grid-cols-1",
                  post.attachments.length === 2 && "grid-cols-2",
                  post.attachments.length >= 3 && "grid-cols-2"
                )}>
                  {post.attachments.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt="Post attachment"
                      className="w-full h-auto max-h-[400px] object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => window.open(imageUrl, '_blank')}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-1 pt-3 ml-[52px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikePost(post.id, isLiked)}
                  className={cn(
                    "h-8 w-8 p-0 relative hover:bg-accent/50",
                    isLiked && "text-red-500 hover:text-red-600"
                  )}
                  title="Like"
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                  {post.likes.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                      {post.likes.length}
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(post.id)}
                  className="h-8 w-8 p-0 relative hover:bg-accent/50"
                  title="Comment"
                >
                  <MessageCircle className="h-4 w-4" />
                  {(post.comments?.length || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                      {post.comments?.length}
                    </span>
                  )}
                </Button>
              </div>

              {commentsOpen && (
                <div className="mt-4 pt-4 border-t border-border/50 space-y-3 ml-[52px]">
                  {post.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={resolveAvatarUrl(comment.author?.avatar_url, comment.author?.first_name, comment.author?.last_name)} />
                        <AvatarFallback className="text-xs">
                          {comment.author?.first_name?.[0]}{comment.author?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="bg-muted/50 rounded-xl p-3">
                          <p className="text-sm font-medium mb-1">
                            {comment.author?.first_name} {comment.author?.last_name}
                          </p>
                          <p className="text-sm text-foreground/90 break-words">{comment.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 ml-3">
                          {format(new Date(comment.created_at), 'd MMM • HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2.5">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={resolveAvatarUrl(user?.user_metadata?.avatar_url, user?.user_metadata?.first_name, user?.user_metadata?.last_name)} />
                      <AvatarFallback className="text-xs">
                        {user?.user_metadata?.first_name?.[0]}{user?.user_metadata?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newComments[post.id] || ""}
                        onChange={(e) => setNewComments(prev => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id, newComments[post.id] || "");
                          }
                        }}
                        className="flex-1 bg-muted/50 rounded-xl px-4 py-2 text-sm border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        disabled={addCommentMutation.isPending}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id, newComments[post.id] || "")}
                        disabled={!newComments[post.id]?.trim() || addCommentMutation.isPending}
                        className="h-9 w-9 p-0 rounded-full flex-shrink-0"
                      >
                        {addCommentMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUp className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </Card>
  );
}
