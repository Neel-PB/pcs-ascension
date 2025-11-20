import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSendMessage } from "@/hooks/useMessages";
import { Send, Paperclip, Image, FileText, FileSpreadsheet, X, Bold, Italic, Underline, List, ListOrdered, ArrowUp } from "lucide-react";
import RecipientMultiSelect from "./RecipientMultiSelect";
import { roleGroups } from "@/hooks/useMessages";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const processFiles = async (selectedFiles: FileList): Promise<ProcessedFile[]> => {
    const processedFiles: ProcessedFile[] = [];
    const filesArray = Array.from(selectedFiles);

    for (const file of filesArray) {
      try {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        const isDoc = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                      file.type === 'application/msword';
        const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                        file.type === 'application/vnd.ms-excel';
        const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
        const isText = file.type === 'text/plain' || file.type === 'application/json';

        if (!isImage && !isPdf && !isDoc && !isExcel && !isCsv && !isText) {
          toast({
            title: "Unsupported file type",
            description: `${file.name}: Only images, PDFs, Word docs, Excel files, CSV, and text files are supported`,
            variant: "destructive",
          });
          continue;
        }

        if (file.size > 25 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name}: Maximum 25MB allowed`,
            variant: "destructive",
          });
          continue;
        }

        let processedFile: ProcessedFile;

        if (isDoc) {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          const cleanedText = result.value
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .trim();
            
          processedFile = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: 'doc',
            data: cleanedText,
            mimeType: file.type,
            size: file.size,
            extractedText: cleanedText
          };
        } else if (isExcel) {
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          let csvData = '';
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            csvData += `Sheet: ${sheetName}\n`;
            csvData += XLSX.utils.sheet_to_csv(worksheet);
            csvData += '\n\n';
          });
          processedFile = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: 'excel',
            data: csvData,
            mimeType: file.type,
            size: file.size,
            extractedText: csvData
          };
        } else if (isCsv || isText) {
          const text = await file.text();
          processedFile = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: isCsv ? 'csv' : 'text',
            data: text,
            mimeType: file.type,
            size: file.size,
            extractedText: text
          };
        } else {
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = () => {
              const base64Data = (reader.result as string).split(',')[1];
              processedFile = {
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
          continue;
        }

        processedFiles.push(processedFile);
      } catch (error) {
        toast({
          title: "Error processing file",
          description: `${file.name}: Failed to process file`,
          variant: "destructive",
        });
      }
    }

    return processedFiles;
  };

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

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(f => f.id !== id));
  };

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
    
    // Check heading levels
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      const parentElement = selection.anchorNode.nodeType === Node.TEXT_NODE 
        ? selection.anchorNode.parentElement 
        : selection.anchorNode as HTMLElement;
      
      const headingElement = parentElement?.closest('h1, h2, h3');
      if (headingElement) {
        formats.add(headingElement.tagName.toLowerCase());
      }
    }
    
    setActiveFormats(formats);
  };

  const execCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    
    // For formatBlock, only execute if there's content
    if (command === 'formatBlock') {
      const selection = window.getSelection();
      const hasContent = editorRef.current?.textContent?.trim().length > 0;
      const hasSelection = selection && !selection.isCollapsed;
      
      if (!hasContent && !hasSelection) {
        return;
      }
    }
    
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setTimeout(updateActiveFormats, 10);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!content.trim() || selectedRoles.length === 0) {
      return;
    }

    sendMessage(
      { title: "Feed Post", message: content.trim(), targetRoles: selectedRoles },
      {
        onSuccess: () => {
          setContent("");
          if (editorRef.current) {
            editorRef.current.innerHTML = "";
          }
          setSelectedRoles([]);
          setAttachments([]);
        },
      }
    );
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

  const canSend = content.trim().length > 0 && selectedRoles.length > 0 && !isPending && !isProcessing;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Send className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Create Feed Post</h2>
      </div>

      <div className="bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-200">
        <div className="px-3 pt-3">
          {renderAttachments()}
          
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onMouseUp={updateActiveFormats}
            onKeyUp={updateActiveFormats}
            className="w-full bg-transparent border-0 resize-none outline-none placeholder:text-muted-foreground text-sm focus:ring-0 focus:border-0 min-h-[120px] max-h-[400px] overflow-y-auto [&_h1]:text-2xl [&_h1]:my-2 [&_h2]:text-xl [&_h2]:my-2 [&_h3]:text-lg [&_h3]:my-1 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2 [&_li]:my-1"
            data-placeholder="Type your feed post here..."
            style={{
              lineHeight: '1.5'
            }}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 pt-2">
          {/* Left Side - Formatting Buttons */}
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
            
            <div className="w-px h-5 bg-border/40 mx-1" />
            
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-lg hover:bg-accent text-xs ${activeFormats.has('h1') ? 'bg-blue-500/20' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCommand('formatBlock', 'h1')}
                  title="Text Size 1"
                >
                  T1
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-lg hover:bg-accent text-xs ${activeFormats.has('h2') ? 'bg-blue-500/20' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCommand('formatBlock', 'h2')}
                  title="Text Size 2"
                >
                  T2
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-lg hover:bg-accent text-xs ${activeFormats.has('h3') ? 'bg-blue-500/20' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCommand('formatBlock', 'h3')}
                  title="Text Size 3"
                >
                  T3
                </Button>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2">
            <RecipientMultiSelect
              selectedRoles={selectedRoles}
              onRoleChange={setSelectedRoles}
              roleGroups={roleGroups}
            />
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-accent"
              onClick={handleAttachClick}
              disabled={isPending || attachments.length >= 10}
            >
              <Paperclip className="h-3 w-3" />
            </Button>

            <Button
              type="button"
              size="icon"
              className="h-8 w-8 rounded-full disabled:opacity-50"
              onClick={() => handleSubmit()}
              disabled={!canSend}
              title="Send"
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
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json"
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