import { Pencil, RotateCcw, MessageSquare, ChevronDown, Send } from '@/lib/icons';
import { FiClock } from 'react-icons/fi';

type PositionsDemoVariant = 'active-fte-steps' | 'shift-override-steps' | 'comments-preview';

interface PositionsDemoPreviewProps {
  variant: PositionsDemoVariant;
}

/* ─── Shared Cell State Row ─── */

const CellStateRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 flex items-center gap-1 rounded border border-border bg-background px-2 py-1 min-h-[28px]">
      {children}
    </div>
    <span className="text-[8px] text-muted-foreground flex-shrink-0 max-w-[120px]">{label}</span>
  </div>
);

/* ─── Active FTE Steps Preview ─── */

const ActiveFteStepsPreview = () => (
  <div className="rounded-lg border border-border bg-card p-2.5 space-y-2 mt-1">
    <p className="text-[9px] font-semibold text-foreground/80 uppercase tracking-wide">Active FTE Workflow</p>

    {/* State 1: Default cell */}
    <CellStateRow label="Click cell to edit FTE">
      <span className="text-[9px] font-mono font-medium text-foreground/80 flex-1">1.0</span>
      <Pencil className="h-3 w-3 text-muted-foreground ml-1" />
    </CellStateRow>

    <div className="ml-3 w-px h-2 bg-border" />

    {/* State 2: Popover mockup */}
    <div className="flex items-start gap-2">
      <div className="flex-1 rounded-lg border border-primary/30 bg-background p-2 space-y-1.5 shadow-sm">
        <div className="space-y-1">
          <span className="text-[8px] text-muted-foreground">Status Reason</span>
          <div className="flex items-center justify-between rounded border border-border bg-background px-1.5 py-0.5">
            <span className="text-[9px] text-foreground/80">LOA</span>
            <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-0.5">
            <span className="text-[8px] text-muted-foreground">Active FTE</span>
            <div className="rounded border border-border bg-background px-1.5 py-0.5 text-[9px] font-mono text-foreground/80">0.5</div>
          </div>
          <div className="flex-1 space-y-0.5">
            <span className="text-[8px] text-muted-foreground">Expiration</span>
            <div className="rounded border border-border bg-background px-1.5 py-0.5 text-[9px] text-foreground/70">Mar 15, 2026</div>
          </div>
        </div>
        <div className="space-y-0.5">
          <span className="text-[8px] text-muted-foreground">Comment (optional)</span>
          <div className="rounded border border-border bg-background px-1.5 py-0.5 text-[9px] text-muted-foreground/50 italic h-5">Returning from leave...</div>
        </div>
        <div className="flex justify-end gap-1.5 pt-0.5">
          <span className="text-[7px] font-medium text-muted-foreground px-1.5 py-0.5 rounded border border-border">Cancel</span>
          <span className="text-[7px] font-medium text-primary-foreground bg-primary px-1.5 py-0.5 rounded">Save</span>
        </div>
      </div>
      <span className="text-[8px] text-muted-foreground flex-shrink-0 max-w-[100px] mt-1">Select status, FTE, expiry & comment</span>
    </div>

    <div className="ml-3 w-px h-2 bg-border" />

    {/* State 3: Saved state */}
    <CellStateRow label="Override saved. Click ↺ to revert.">
      <span className="text-[9px] font-mono font-medium text-primary flex-1">0.5</span>
      <span className="text-[7px] font-medium rounded px-1 py-0.5 bg-primary/10 text-primary border border-primary/30">LOA</span>
      <span className="text-[7px] text-muted-foreground ml-1">exp 3/15</span>
      <RotateCcw className="h-3 w-3 text-muted-foreground ml-1" />
    </CellStateRow>
  </div>
);

/* ─── Shift Override Steps Preview ─── */

const ShiftOverrideStepsPreview = () => (
  <div className="rounded-lg border border-border bg-card p-2.5 space-y-2 mt-1">
    <p className="text-[9px] font-semibold text-foreground/80 uppercase tracking-wide">Shift Override Workflow</p>

    {/* State 1: Special shift with pencil */}
    <CellStateRow label="Special shift — click pencil">
      <span className="text-[9px] text-foreground/80 flex-1">Rotating</span>
      <Pencil className="h-3 w-3 text-muted-foreground ml-1" />
    </CellStateRow>

    <div className="ml-3 w-px h-2 bg-border" />

    {/* State 2: Day/Night selector */}
    <div className="flex items-start gap-2">
      <div className="flex-1 rounded-lg border border-primary/30 bg-background p-2 space-y-1.5 shadow-sm">
        <div className="space-y-0.5">
          <span className="text-[8px] text-muted-foreground">Original Shift</span>
          <p className="text-[9px] font-medium text-foreground/80">Rotating</p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[8px] text-muted-foreground">Day/Night Selection</span>
          <div className="flex items-center justify-between rounded border border-border bg-background px-1.5 py-0.5">
            <span className="text-[9px] text-foreground/80">Day</span>
            <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
          </div>
        </div>
      </div>
      <span className="text-[8px] text-muted-foreground flex-shrink-0 max-w-[100px] mt-1">Select Day or Night</span>
    </div>

    <div className="ml-3 w-px h-2 bg-border" />

    {/* State 3: Modified display */}
    <CellStateRow label="Override active. Click ↺ to revert.">
      <span className="flex-1 inline-flex items-center gap-1 whitespace-nowrap">
        <span className="text-[9px] text-muted-foreground line-through">Rotating</span>
        <span className="text-[9px] text-muted-foreground">→</span>
        <span className="text-[9px] font-medium text-foreground/80">Day</span>
      </span>
      <RotateCcw className="h-3 w-3 text-muted-foreground ml-1" />
    </CellStateRow>
  </div>
);

/* ─── Comments Preview ─── */

const CommentsPreview = () => (
  <div className="rounded-lg border border-border bg-card p-2.5 space-y-2 mt-1">
    <p className="text-[9px] font-semibold text-foreground/80 uppercase tracking-wide">Activity &amp; Comments</p>

    {/* Activity log entry */}
    <div className="flex gap-2">
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <FiClock className="h-2.5 w-2.5 text-primary" />
        </div>
        <div className="w-px flex-1 bg-border mt-0.5" />
      </div>
      <div className="flex-1 pb-2">
        <div className="rounded-md bg-primary/5 border border-primary/15 px-2 py-1">
          <p className="text-[8px] text-primary font-medium">FTE Override Changed</p>
          <p className="text-[8px] text-foreground/70">Active FTE: 1.0 → 0.5 (LOA)</p>
          <p className="text-[7px] text-muted-foreground mt-0.5">Sarah M. · 2 hours ago</p>
        </div>
      </div>
    </div>

    {/* Regular comment */}
    <div className="flex gap-2">
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center shrink-0">
          <MessageSquare className="h-2.5 w-2.5 text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1">
        <div className="rounded-md border border-border px-2 py-1">
          <p className="text-[8px] text-foreground/80">Expected to return mid-March. Backfill not needed.</p>
          <p className="text-[7px] text-muted-foreground mt-0.5">John D. · 1 hour ago</p>
        </div>
      </div>
    </div>

    {/* Composer bar */}
    <div className="flex items-center gap-1.5 rounded border border-border bg-background px-2 py-1 mt-1">
      <span className="text-[8px] text-muted-foreground/50 flex-1">Add a comment...</span>
      <Send className="h-3 w-3 text-muted-foreground" />
    </div>
  </div>
);

/* ─── Main Export ─── */

export function PositionsDemoPreview({ variant }: PositionsDemoPreviewProps) {
  switch (variant) {
    case 'active-fte-steps':
      return <ActiveFteStepsPreview />;
    case 'shift-override-steps':
      return <ShiftOverrideStepsPreview />;
    case 'comments-preview':
      return <CommentsPreview />;
    default:
      return null;
  }
}
