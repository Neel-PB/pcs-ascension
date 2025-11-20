import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSendMessage } from "@/hooks/useMessages";
import { Send, Paperclip, Image, FileText, FileSpreadsheet, X } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import RecipientMultiSelect from "./RecipientMultiSelect";
import { roleGroups } from "@/hooks/useMessages";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  data: string;
  mimeType: string;
  size: number;
  extractedText?: string;
}

export function FeedComposer() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<ProcessedFile[]>([]);
  const { mutate: sendMessage, isPending } = useSendMessage();

  const processFiles = async (fileList: FileList): Promise<ProcessedFile[]> => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    const maxFiles = 10;
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'text/plain'
    ];

    const files = Array.from(fileList).slice(0, maxFiles);
    const processed: ProcessedFile[] = [];

    for (const file of files) {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds 20MB limit`);
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        console.warn(`File type ${file.type} not supported`);
        continue;
      }

      try {
        let data = '';
        let extractedText = '';

        if (file.type.startsWith('image/')) {
          data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          extractedText = result.value;
          data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.type === 'application/vnd.ms-excel' || 
                   file.type === 'text/csv') {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          extractedText = XLSX.utils.sheet_to_txt(firstSheet);
          data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        } else {
          data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        }

        processed.push({
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          type: file.type,
          data,
          mimeType: file.type,
          size: file.size,
          extractedText,
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    return processed;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const processed = await processFiles(e.target.files);
      setAttachments(prev => [...prev, ...processed].slice(0, 10));
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || selectedRoles.length === 0) {
      return;
    }

    sendMessage(
      { title: title.trim(), message: content.trim(), targetRoles: selectedRoles },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setSelectedRoles([]);
          setAttachments([]);
        },
      }
    );
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('spreadsheet') || type.includes('excel') || type === 'text/csv') 
      return <FileSpreadsheet className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const canSend = title.trim() && content.trim() && selectedRoles.length > 0 && !isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Send className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Create Feed Post</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm text-muted-foreground">Subject</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post subject..."
            maxLength={200}
            className="bg-background/95 backdrop-blur-sm border-border/60 focus-visible:ring-primary/20 focus-visible:border-primary/40"
            required
          />
        </div>

        <div className="relative">
          <div className="bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-200">
            {attachments.length > 0 && (
              <div className="flex gap-2 flex-wrap p-3 border-b border-border/40">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-1.5 text-xs"
                  >
                    {getFileIcon(file.type)}
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file.id)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <RichTextEditor value={content} onChange={setContent} />

            <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1 border-t border-border/40">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf,.docx,.xlsx,.xls,.csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isPending || attachments.length >= 10}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isPending || attachments.length >= 10}
                  className="h-7 w-7 p-0 rounded-lg hover:bg-accent"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <RecipientMultiSelect
                  selectedRoles={selectedRoles}
                  onRoleChange={setSelectedRoles}
                  roleGroups={roleGroups}
                />
              </div>

              <Button
                type="submit"
                disabled={!canSend}
                size="sm"
                className="h-7 px-3 gap-1.5"
              >
                <Send className="h-3 w-3" />
                {isPending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
