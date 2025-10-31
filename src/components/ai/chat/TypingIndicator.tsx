export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm px-4 py-2">
      <span>Assistant is typing</span>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};
