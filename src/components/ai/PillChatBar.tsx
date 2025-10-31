import React, { useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Paperclip, Send, ChevronDown, X, Plus, Menu, ChevronUp, ArrowUp, Square, ChevronRight, FileText, Image, FileSpreadsheet, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from './VoiceRecorder';
import { useToast } from '@/hooks/use-toast';
import { getAbbreviatedModelName } from '@/config/geminiModels';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

interface ProcessedFile {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'excel' | 'text' | 'csv';
  data: string; // base64 or extracted text
  mimeType: string;
  size: number;
  extractedText?: string;
}

interface PillChatBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string, attachments?: ProcessedFile[]) => void;
  onAttach?: (files: ProcessedFile[]) => void;
  onRemoveAttachment?: (id: string) => void;
  attachments?: ProcessedFile[];
  isLoading?: boolean;
  isGenerating?: boolean;
  onStop?: () => void;
  showVoice?: boolean;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  models?: Array<{ id: string; name: string; description?: string }>;
  placeholder?: string;
  showNewConversation?: boolean;
  showToggleSidebar?: boolean;
  onNewConversation?: () => void;
  onToggleSidebar?: () => void;
  onMinimize?: () => void;
  onClearChat?: () => void;
  onDocumentSearch?: (query: string) => void;
  showDocumentSearch?: boolean;
  className?: string;
}

export const PillChatBar: React.FC<PillChatBarProps> = ({
  value,
  onChange,
  onSend,
  onAttach,
  attachments = [],
  onRemoveAttachment,
  selectedModel,
  onModelChange,
  models = [],
  isLoading = false,
  isGenerating = false,
  onStop,
  placeholder = "Ask anything...",
  showVoice = true,
  showNewConversation = false,
  showToggleSidebar = false,
  onNewConversation,
  onToggleSidebar,
  onMinimize,
  onClearChat,
  onDocumentSearch,
  showDocumentSearch = false,
  className,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      onSend(value, attachments);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

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

        // Validate file type
        if (!isImage && !isPdf && !isDoc && !isExcel && !isCsv && !isText) {
          toast({
            title: "Unsupported file type",
            description: `${file.name}: Only images, PDFs, Word docs, Excel files, CSV, and text files are supported`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (25MB limit)
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
          // Extract text from Word documents
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          
          // Clean up the extracted text
          const cleanedText = result.value
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .replace(/^\s*[•·‣◦▪▫⁃]\s*$/gm, '')
            .replace(/^\s*[•·‣◦▪▫⁃]\s*\n/gm, '')
            .replace(/[ \t]+/g, ' ')
            .replace(/[ \t]+$/gm, '')
            .replace(/^(\s*)([•·‣◦▪▫⁃])\s*/gm, '$1• ')
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
          // Extract data from Excel files
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
          // Read text files and CSV
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
          // Handle images and PDFs as base64
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
      if (processed.length > 0 && onAttach) {
        onAttach(processed);
      }
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const files = items
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter(Boolean) as File[];
    
    if (files.length > 0 && onAttach) {
      e.preventDefault();
      setIsProcessing(true);
      try {
        const fileList = new DataTransfer();
        files.forEach(file => fileList.items.add(file));
        const processed = await processFiles(fileList.files);
        if (processed.length > 0) {
          onAttach(processed);
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    const currentText = value || '';
    const newText = currentText + (currentText ? ' ' : '') + transcript;
    onChange(newText);
  };

  const canSend = value.trim().length > 0 && !isLoading && !isGenerating && !isProcessing;

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
      <div className="flex items-center gap-1 mr-2">
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
              onClick={() => onRemoveAttachment?.(attachment.id)}
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

  return (
    <div className="flex items-end w-full">
      <div className="flex-1 relative">
        <div className="bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-200">
          
          {/* Text Input Area */}
          <div className="px-3 pt-3">
            {renderAttachments()}
            
            <TextareaAutosize
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
              placeholder={placeholder}
              disabled={isLoading}
              minRows={1}
              maxRows={6}
              className={cn(
                "w-full bg-transparent border-0 resize-none outline-none placeholder:text-muted-foreground text-sm",
                "focus:ring-0 focus:border-0"
              )}
              style={{ lineHeight: '1.5' }}
            />
          </div>

          {/* Utility Buttons */}
          <div className="flex items-center justify-between px-3 pb-3 pt-2">
            {/* Left Side */}
            <div className="flex items-center gap-2">
              {onMinimize && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-accent"
                  onClick={onMinimize}
                  disabled={isLoading}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              )}

              {onClearChat && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-accent"
                  onClick={onClearChat}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {showDocumentSearch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg hover:bg-accent"
                  onClick={() => onDocumentSearch?.(value)}
                  disabled={isLoading || !value.trim()}
                >
                  <FileSearch className="h-3 w-3" />
                </Button>
              )}
              
              {/* Model Select */}
              {models.length > 0 && (
                <Select value={selectedModel} onValueChange={onModelChange}>
                  <SelectTrigger className="h-6 w-auto min-w-[80px] text-xs border rounded-md px-3">
                    <SelectValue>
                      {selectedModel ? getAbbreviatedModelName(models.find(m => m.id === selectedModel)?.name || selectedModel) : "Auto"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="end">
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <div className="text-sm font-medium">{getAbbreviatedModelName(model.name)}</div>
                          {model.description && (
                            <div className="text-xs text-muted-foreground">{model.description}</div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {showVoice && (
                <VoiceRecorder
                  onTranscript={handleVoiceTranscript}
                  disabled={isLoading}
                />
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg hover:bg-accent"
                onClick={handleAttachClick}
                disabled={isLoading}
              >
                <Paperclip className="h-3 w-3" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-lg hover:bg-accent",
                  canSend || isGenerating ? "text-primary" : "text-muted-foreground"
                )}
                onClick={() => {
                  if (isGenerating && onStop) {
                    onStop();
                  } else if (canSend) {
                    onSend(value, attachments);
                  }
                }}
                disabled={!canSend && !isGenerating}
              >
                {isGenerating ? <Square className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
              </Button>
            </div>
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
    </div>
  );
};
