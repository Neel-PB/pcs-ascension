import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useCreatePost } from "@/hooks/useEmployeeFeed";
import { Send, Paperclip, Image, FileText, FileSpreadsheet, X, Bold, Italic, Underline, List, ListOrdered, ArrowUp } from "@/lib/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define the structure for a processed file
interface ProcessedFile {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'excel' | 'text' | 'csv';
  data: string;
  mimeType: string;
  size: number;
  extractedText?: string;
}

export function FeedComposer() {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const { mutate: createPost, isPending } = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const processFiles = async (selectedFiles: FileList): Promise<ProcessedFile[]> => {
    const processedFiles: ProcessedFile[] = [];
    const filesArray = Array.from(selectedFiles);

    for (const file of filesArray) {
      try {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
          toast.error("Unsupported file type", {
            description: `${file.name}: Only images and PDFs are supported`,
          });
          continue;
        }

        if (file.size > 25 * 1024 * 1024) {
          toast.error("File too large", {
            description: `${file.name}: Maximum 25MB allowed`,
          });
          continue;
        }

        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = () => {
            const base64Data = (reader.result as string).split(',')[1];
            const processedFile: ProcessedFile = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              type: isImage ? 'image' : 'pdf',
              data: base64Data,
              mimeType: file.type,
              size: file.size
            };
            processedFiles.push(processedFile);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      } catch (error) {
        toast.error("Error processing file", {
          description: `${file.name}: Failed to process file`,
        });
      }
    }

    return processedFiles;
  };

  // Function to handle file selection and processing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const processed = await processFiles(files);
      if (processed.length > 0) {
        setAttachments(prev => [...prev, ...processed].slice(0, 10));
      }
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Function to remove an attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(f => f.id !== id));
  };

  // Function to trigger the file input dialog
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const updateActiveFormats = () => {
    const formats = new Set<string>();
    
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
    if (document.queryCommandState('insertOrderedList')) formats.add('ol');
    
    setActiveFormats(formats);
  };

  const execCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setTimeout(updateActiveFormats, 10);
  };

  const uploadAttachmentToStorage = async (file: ProcessedFile): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      let fileToUpload: Blob;
      if (file.type === 'image' || file.type === 'pdf') {
        const base64Response = await fetch(`data:${file.mimeType};base64,${file.data}`);
        fileToUpload = await base64Response.blob();
      } else {
        fileToUpload = new Blob([file.data], { type: file.mimeType });
      }

      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(filePath, fileToUpload, {
          contentType: file.mimeType,
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error("Upload failed", {
        description: `Failed to upload ${file.name}`,
      });
      return null;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadedUrls: string[] = [];
      for (const file of attachments) {
        const url = await uploadAttachmentToStorage(file);
        if (url) uploadedUrls.push(url);
      }

      createPost(
        { 
          content: content.trim(), 
          post_type: 'general',
          attachments: uploadedUrls
        },
        {
          onSuccess: () => {
            setContent("");
            if (editorRef.current) {
              editorRef.current.innerHTML = "";
            }
            setAttachments([]);
            toast.success("Success", {
              description: "Post created successfully",
            });
          },
          onError: () => {
            toast.error("Error", {
              description: "Failed to create post",
            });
          },
        }
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const getFileIcon = (type: ProcessedFile['type']) => {
    switch (type) {
      case 'image':
        return <Image className="h-3 w-3" />;
      case 'excel':
        return <FileSpreadsheet className="h-3 w-3" />;
      case 'pdf':
      case 'doc':
      case 'text':
      case 'csv':
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const renderAttachments = () => {
    if (attachments.length === 0) return null;

    const visibleAttachments = attachments.slice(0, 2);
    const hiddenCount = attachments.length - 2;

    return (
      <div className="flex items-center gap-1 mb-2">
        {visibleAttachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-1 bg-secondary/50 rounded-full px-2 py-1 text-xs max-w-[100px]"
          >
            {getFileIcon(attachment.type)}
            <span className="truncate text-secondary-foreground">
              {attachment.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-secondary"
              onClick={() => handleRemoveAttachment(attachment.id)}
              aria-label={`Remove ${attachment.name}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {hiddenCount > 0 && (
          <div className="bg-secondary/50 rounded-full px-2 py-1 text-xs text-secondary-foreground">
            +{hiddenCount}
          </div>
        )}
        {isProcessing && (
          <div className="bg-primary/10 rounded-full px-2 py-1 text-xs text-primary animate-pulse">
            Processing...
          </div>
        )}
      </div>
    );
  };

  const canSend = content.trim().length > 0 && !isPending && !isProcessing && !isUploading;

  return (
    <div>
      <div className="bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-200">
        <div className="px-3 pt-3">
          {renderAttachments()}
          
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onMouseUp={updateActiveFormats}
            onKeyUp={updateActiveFormats}
            className="w-full bg-transparent border-0 resize-none outline-none placeholder:text-muted-foreground text-sm focus:ring-0 focus:border-0 min-h-[120px] max-h-[400px] overflow-y-auto [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2 [&_li]:my-1"
            data-placeholder="Type your feed post here..."
            style={{
              lineHeight: '1.5'
            }}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 pt-2">
          <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-lg hover:bg-accent ${activeFormats.has('bold') ? 'bg-blue-500/20' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCommand('bold')}
                  title="Bold"
                >
                  <Bold className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-lg hover:bg-accent ${activeFormats.has('italic') ? 'bg-blue-500/20' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCommand('italic')}
                  title="Italic"
                >
                  <Italic className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-lg hover:bg-accent ${activeFormats.has('underline') ? 'bg-blue-500/20' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCommand('underline')}
                  title="Underline"
                >
                  <Underline className="h-3 w-3" />
                </Button>
            
            <div className="w-px h-5 bg-border/40 mx-1" />
            
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-lg hover:bg-accent ${activeFormats.has('ul') ? 'bg-blue-500/20' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCommand('insertUnorderedList')}
                  title="Bullet List"
                >
                  <List className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-lg hover:bg-accent ${activeFormats.has('ol') ? 'bg-blue-500/20' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCommand('insertOrderedList')}
                  title="Numbered List"
                >
                  <ListOrdered className="h-3 w-3" />
                </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-accent"
              onClick={handleAttachClick}
              disabled={isPending || attachments.length >= 10 || isUploading}
            >
              <Paperclip className="h-3 w-3" />
            </Button>

            <Button
              type="button"
              size="icon"
              className="h-8 w-8 rounded-full disabled:opacity-50"
              onClick={() => handleSubmit()}
              disabled={!canSend}
              title={isUploading ? "Uploading..." : "Send"}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*,.pdf"
      />

      <style>{`
        [contentEditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
