import React, { useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { X, ArrowUp, Square, ChevronRight, FileSearch, Filter } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from './VoiceRecorder';
import { getAbbreviatedModelName } from '@/config/geminiModels';

/**
 * Desktop browsers mostly ignore `autoCapitalize` on textarea; apply sentence-style caps in JS.
 */
function applySentenceAutoCapitalize(text: string): string {
  if (!text) return text;
  let s = text;
  s = s.replace(/^(\s*)([a-z])/, (_, ws: string, letter: string) => ws + letter.toUpperCase());
  s = s.replace(/\n(\s*)([a-z])/g, (_, ws: string, letter: string) => '\n' + ws + letter.toUpperCase());
  s = s.replace(/([.!?])\s+([a-z])/g, (_, punct: string, letter: string) => `${punct} ${letter.toUpperCase()}`);
  s = s.replace(/\bi\b/g, 'I');
  return s;
}

/**
 * Bottom-row ghost buttons: `Button` `size="icon"` forces `[&_svg]:size-6`, which ignores small icon classes.
 * These classes override SVG size and keep tap targets usable.
 */
const rowBtn =
  'h-6 w-6 shrink-0 rounded-lg p-0 min-w-0 hover:bg-accent [&_svg]:!h-3.5 [&_svg]:!w-3.5 [&_svg]:shrink-0';
const rowIcon = 'h-3.5 w-3.5 shrink-0';

/** Send / stop control: filled circle (not plain ghost like the other row icons). */
const sendCircleBtn =
  'h-6 w-6 shrink-0 rounded-full p-0 min-w-0 border-0 shadow-sm [&_svg]:!h-3.5 [&_svg]:!w-3.5 [&_svg]:shrink-0';

/** Page scope filter on — filled primary like send. */
const filterToggleOn =
  'h-6 w-6 shrink-0 rounded-full p-0 min-w-0 border-0 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 [&_svg]:!h-3.5 [&_svg]:!w-3.5 [&_svg]:shrink-0 [&_svg]:!text-primary-foreground';

/** Page scope filter off — muted circle (mirrors disabled send). */
const filterToggleOff =
  'h-6 w-6 shrink-0 rounded-full p-0 min-w-0 border-0 bg-muted text-muted-foreground shadow-none hover:bg-muted/80 [&_svg]:!h-3.5 [&_svg]:!w-3.5 [&_svg]:shrink-0 [&_svg]:!text-muted-foreground';

interface PillChatBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
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
  /** Include Staffing/Positions region–department filters in AI requests when true. */
  scopeFiltersEnabled?: boolean;
  onToggleScopeFilters?: () => void;
  className?: string;
}

export const PillChatBar: React.FC<PillChatBarProps> = ({
  value,
  onChange,
  onSend,
  selectedModel,
  onModelChange,
  models = [],
  isLoading = false,
  isGenerating = false,
  onStop,
  placeholder = 'Ask anything...',
  showVoice = true,
  onMinimize,
  onClearChat,
  onDocumentSearch,
  showDocumentSearch = false,
  scopeFiltersEnabled = true,
  onToggleScopeFilters,
  className,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(applySentenceAutoCapitalize(e.target.value));
  };

  const handleVoiceTranscript = (transcript: string) => {
    const currentText = value || '';
    const newText = currentText + (currentText ? ' ' : '') + transcript;
    onChange(applySentenceAutoCapitalize(newText));
  };

  const canSend = value.trim().length > 0 && !isLoading && !isGenerating;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      onSend(value);
    }
  };

  return (
    <div className={cn('flex items-end w-full', className)}>
      <div className="flex-1 relative">
        <div className="bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-200">
          <div className="px-3 pt-3">
            <TextareaAutosize
              ref={textareaRef}
              value={value}
              onChange={handleTextChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={isLoading}
              autoCapitalize="sentences"
              minRows={1}
              maxRows={6}
              className={cn(
                'w-full bg-transparent border-0 resize-none outline-none placeholder:text-muted-foreground text-sm',
                'focus:ring-0 focus:border-0',
              )}
              style={{ lineHeight: '1.5' }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-1">
            <div className="flex items-center justify-start gap-2 min-w-0">
              {onMinimize && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={rowBtn}
                  onClick={onMinimize}
                  disabled={isLoading}
                >
                  <ChevronRight className={rowIcon} />
                </Button>
              )}

              {onClearChat && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={rowBtn}
                  onClick={onClearChat}
                  disabled={isLoading}
                >
                  <X className={rowIcon} />
                </Button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              {showDocumentSearch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={rowBtn}
                  onClick={() => onDocumentSearch?.(value)}
                  disabled={isLoading || !value.trim()}
                >
                  <FileSearch className={rowIcon} />
                </Button>
              )}

              {models.length > 0 && (
                <Select value={selectedModel} onValueChange={onModelChange}>
                  <SelectTrigger className="h-6 w-auto min-w-[80px] text-xs border rounded-md px-3">
                    <SelectValue>
                      {selectedModel
                        ? getAbbreviatedModelName(models.find((m) => m.id === selectedModel)?.name || selectedModel)
                        : 'Auto'}
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

              {onToggleScopeFilters && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={scopeFiltersEnabled ? filterToggleOn : filterToggleOff}
                      onClick={onToggleScopeFilters}
                      disabled={isLoading}
                      aria-pressed={scopeFiltersEnabled}
                      aria-label={
                        scopeFiltersEnabled
                          ? 'Page scope filters on for AI'
                          : 'Page scope filters off for AI'
                      }
                    >
                      <Filter className={rowIcon} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="end" className="max-w-[260px]">
                    <p className="text-xs font-medium">
                      {scopeFiltersEnabled ? 'Page scope on' : 'Page scope off'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      {scopeFiltersEnabled
                        ? 'AI requests use region, market, facility, and department from the filter bar (Staffing / Positions).'
                        : 'AI requests ignore those filters; module and page context still apply.'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}

              {showVoice && (
                <VoiceRecorder onTranscript={handleVoiceTranscript} disabled={isLoading} />
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  sendCircleBtn,
                  isGenerating
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : canSend
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground shadow-none',
                )}
                onClick={() => {
                  if (isGenerating && onStop) {
                    onStop();
                  } else if (canSend) {
                    onSend(value);
                  }
                }}
                disabled={!canSend && !isGenerating}
              >
                {isGenerating ? <Square className={cn(rowIcon, 'fill-current')} /> : <ArrowUp className={rowIcon} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
