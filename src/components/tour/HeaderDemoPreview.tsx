type HeaderDemoVariant = 'notification-panel' | 'theme-cycle';

interface HeaderDemoPreviewProps {
  variant: HeaderDemoVariant;
}

const NotificationPanelPreview = () => (
  <div className="mt-2 rounded-lg border border-border bg-background/80 overflow-hidden" style={{ width: 240 }}>
    {/* Tab bar */}
    <div className="flex border-b border-border text-[9px] font-semibold">
      <div className="flex-1 text-center py-1.5 text-muted-foreground">Feed</div>
      <div className="flex-1 text-center py-1.5 border-b-2 border-primary text-primary">
        Notifications
        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[7px] font-bold w-3 h-3">3</span>
      </div>
    </div>
    {/* Items */}
    <div className="p-1.5 space-y-1">
      {[
        { title: 'Override expires tomorrow', time: '2m ago', unread: true },
        { title: 'FTE updated by J. Smith', time: '1h ago', unread: true },
        { title: 'New requisition approved', time: '3h ago', unread: false },
      ].map((item, i) => (
        <div key={i} className={`flex items-start gap-1.5 rounded-md px-1.5 py-1 ${item.unread ? 'bg-primary/5' : ''}`}>
          <div className="mt-0.5 h-4 w-4 rounded-full bg-muted flex items-center justify-center shrink-0">
            <div className="h-2 w-2 rounded-sm bg-muted-foreground/40" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-medium text-foreground truncate">{item.title}</p>
            <p className="text-[7px] text-muted-foreground">{item.time}</p>
          </div>
          {item.unread && <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
        </div>
      ))}
    </div>
    {/* Footer */}
    <div className="border-t border-border px-2 py-1 text-center">
      <span className="text-[8px] text-primary font-medium">Mark all as read</span>
    </div>
  </div>
);

const ThemeCyclePreview = () => (
  <div className="mt-2 flex items-center justify-center gap-1.5">
    {[
      { label: 'Light', icon: '☀️', active: true },
      { label: 'Dark', icon: '🌙', active: false },
      { label: 'System', icon: '🖥', active: false },
    ].map((t, i) => (
      <div key={i} className="flex flex-col items-center gap-0.5">
        {i > 0 && (
          <div className="absolute" style={{ marginLeft: -28 }}>
            <span className="text-[9px] text-muted-foreground/50">→</span>
          </div>
        )}
        <div className={`rounded-md border px-2.5 py-1.5 text-center ${t.active ? 'border-primary bg-primary/10' : 'border-border bg-muted/50'}`}>
          <div className="text-sm">{t.icon}</div>
        </div>
        <span className={`text-[8px] font-medium ${t.active ? 'text-primary' : 'text-muted-foreground'}`}>{t.label}</span>
      </div>
    ))}
    <div className="ml-1 text-[8px] text-muted-foreground/60 italic">click to cycle →</div>
  </div>
);

export function HeaderDemoPreview({ variant }: HeaderDemoPreviewProps) {
  switch (variant) {
    case 'notification-panel':
      return <NotificationPanelPreview />;
    case 'theme-cycle':
      return <ThemeCyclePreview />;
    default:
      return null;
  }
}
