import { useState, useRef, KeyboardEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send, Paperclip, X, StopCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

interface ProcessedFile {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'excel' | 'text' | 'csv';
  data: string;
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
  onStopGeneration?: () => void;
  placeholder?: string;
  onClearChat?: () => void;
}

export const PillChatBar = ({
  value,
  onChange,
  onSend,
  onAttach,
  onRemoveAttachment,
  attachments = [],
  isLoading = false,
  isGenerating = false,
  onStopGeneration,
  placeholder = 'Type a message...',
  onClearChat,
}: PillChatBarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (value.trim() && !isLoading && !isGenerating) {
      onSend(value, attachments);
      onChange('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const processFile = async (file: File): Promise<ProcessedFile | null> => {
    const id = `${Date.now()}-${file.name}`;
    
    // Image files
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id,
            name: file.name,
            type: 'image',
            data: e.target?.result as string,
            mimeType: file.type,
            size: file.size,
          });
        };
        reader.readAsDataURL(file);
      });
    }

    // PDF files
    if (file.type === 'application/pdf') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id,
            name: file.name,
            type: 'pdf',
            data: e.target?.result as string,
            mimeType: file.type,
            size: file.size,
          });
        };
        reader.readAsDataURL(file);
      });
    }

    // Word documents
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return {
          id,
          name: file.name,
          type: 'doc',
          data: '',
          mimeType: file.type,
          size: file.size,
          extractedText: result.value,
        };
      } catch (error) {
        console.error('Error processing Word document:', error);
        return null;
      }
    }

    // Excel files
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    ) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        return {
          id,
          name: file.name,
          type: 'excel',
          data: '',
          mimeType: file.type,
          size: file.size,
          extractedText: csvData,
        };
      } catch (error) {
        console.error('Error processing Excel file:', error);
        return null;
      }
    }

    // CSV files
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id,
            name: file.name,
            type: 'csv',
            data: '',
            mimeType: file.type,
            size: file.size,
            extractedText: e.target?.result as string,
          });
        };
        reader.readAsText(file);
      });
    }

    // Text files
    if (file.type.startsWith('text/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id,
            name: file.name,
            type: 'text',
            data: '',
            mimeType: file.type,
            size: file.size,
            extractedText: e.target?.result as string,
          });
        };
        reader.readAsText(file);
      });
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const processed = await Promise.all(files.map(processFile));
    const validFiles = processed.filter((f): f is ProcessedFile => f !== null);
    
    if (validFiles.length > 0 && onAttach) {
      onAttach(validFiles);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10">
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        {/* File Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 border-b border-border">
            {attachments.map((file) => (
              <Badge key={file.id} variant="secondary" className="pr-1">
                <Paperclip className="h-3 w-3 mr-1" />
                <span className="text-xs max-w-[120px] truncate">{file.name}</span>
                {onRemoveAttachment && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onRemoveAttachment(file.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-2 p-3">
          {/* Attach Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isGenerating}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <TextareaAutosize
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading || isGenerating}
              className="w-full resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-sm placeholder:text-muted-foreground disabled:opacity-50"
              minRows={1}
              maxRows={6}
            />
          </div>

          {/* Clear Chat Button */}
          {onClearChat && (
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 flex-shrink-0"
              onClick={onClearChat}
              disabled={isLoading || isGenerating}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          {/* Send/Stop Button */}
          {isGenerating && onStopGeneration ? (
            <Button
              size="icon"
              variant="destructive"
              className="h-9 w-9 rounded-full flex-shrink-0"
              onClick={onStopGeneration}
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="h-9 w-9 rounded-full flex-shrink-0"
              onClick={handleSend}
              disabled={!value.trim() || isLoading || isGenerating}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
        onChange={handleFileSelect}
      />
    </div>
  );
};
