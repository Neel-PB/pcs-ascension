import { Pencil, RotateCcw, MessageSquare, ChevronDown, Send, Clock } from '@/lib/icons';

type PositionsDemoVariant = 'active-fte-steps' | 'shift-override-steps' | 'comments-preview' | 'position-details';

interface PositionsDemoPreviewProps {
  variant: PositionsDemoVariant;
}

/* ─── Shared Cell State Row ─── */

const CellStateRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 flex items-center gap-1 rounded border border-border bg-background px-2 py-1.5 min-h-[30px] border-l-2 border-l-primary/30">
      {children}
    </div>
    <span className="text-[9px] text-muted-foreground flex-shrink-0 max-w-[120px]">{label}</span>
  </div>
);

/* ─── Active FTE Steps Preview ─── */

const ActiveFteStepsPreview = () => (
  <div className="rounded-lg border border-primary/20 bg-primary/[0.02] p-3 space-y-2 mt-1 shadow-sm ring-1 ring-primary/10">
    <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Active FTE Workflow</p>

    {/* State 1: Default cell */}
    <CellStateRow label="Click cell to edit FTE">
      <span className="text-[10px] font-mono font-medium text-foreground/80 flex-1">1.0</span>
      <Pencil className="h-3 w-3 text-muted-foreground ml-1" />
    </CellStateRow>

    <div className="ml-3 w-0.5 h-2.5 bg-primary/20 rounded-full" />

    {/* State 2: Popover mockup */}
    <div className="flex items-start gap-2">
      <div className="flex-1 rounded-lg border border-primary/30 bg-background p-2 space-y-1.5 shadow-sm">
        <div className="space-y-1">
          <span className="text-[9px] text-muted-foreground">Status Reason</span>
          <div className="flex items-center justify-between rounded border border-border bg-background px-1.5 py-0.5">
            <span className="text-[10px] text-foreground/80">LOA</span>
            <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-0.5">
            <span className="text-[9px] text-muted-foreground">Active FTE</span>
            <div className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-foreground/80">0.5</div>
          </div>
          <div className="flex-1 space-y-0.5">
            <span className="text-[9px] text-muted-foreground">Expiration</span>
            <div className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground/70">Mar 15, 2026</div>
          </div>
        </div>
        <div className="space-y-0.5">
          <span className="text-[9px] text-muted-foreground">Comment (optional)</span>
          <div className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground/50 italic h-5">Returning from leave...</div>
        </div>
        <div className="flex justify-end gap-1.5 pt-0.5">
          <span className="text-[8px] font-medium text-muted-foreground px-1.5 py-0.5 rounded border border-border">Cancel</span>
          <span className="text-[8px] font-medium text-primary-foreground bg-primary px-1.5 py-0.5 rounded">Save</span>
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground flex-shrink-0 max-w-[100px] mt-1">Select status, FTE, expiry & comment</span>
    </div>

    <div className="ml-3 w-0.5 h-2.5 bg-primary/20 rounded-full" />

    {/* State 3: Saved state */}
    <CellStateRow label="Override saved. Click ↺ to revert.">
      <span className="text-[10px] font-mono font-medium text-primary flex-1">0.5</span>
      <span className="text-[8px] font-medium rounded px-1 py-0.5 bg-primary/10 text-primary border border-primary/30">LOA</span>
      <span className="text-[8px] text-muted-foreground ml-1">exp 3/15</span>
      <RotateCcw className="h-3 w-3 text-muted-foreground ml-1" />
    </CellStateRow>
  </div>
);

/* ─── Shift Override Steps Preview ─── */

const ShiftOverrideStepsPreview = () => (
  <div className="rounded-lg border border-primary/20 bg-primary/[0.02] p-3 space-y-2 mt-1 shadow-sm ring-1 ring-primary/10">
    <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Shift Override Workflow</p>

    {/* State 1: Special shift with pencil */}
    <CellStateRow label="Special shift — click pencil">
      <span className="text-[10px] text-foreground/80 flex-1">Rotating</span>
      <Pencil className="h-3 w-3 text-muted-foreground ml-1" />
    </CellStateRow>

    <div className="ml-3 w-0.5 h-2.5 bg-primary/20 rounded-full" />

    {/* State 2: Day/Night selector */}
    <div className="flex items-start gap-2">
      <div className="flex-1 rounded-lg border border-primary/30 bg-background p-2 space-y-1.5 shadow-sm">
        <div className="space-y-0.5">
          <span className="text-[9px] text-muted-foreground">Original Shift</span>
          <p className="text-[10px] font-medium text-foreground/80">Rotating</p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[9px] text-muted-foreground">Day/Night Selection</span>
          <div className="flex items-center justify-between rounded border border-border bg-background px-1.5 py-0.5">
            <span className="text-[10px] text-foreground/80">Day</span>
            <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
          </div>
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground flex-shrink-0 max-w-[100px] mt-1">Select Day or Night</span>
    </div>

    <div className="ml-3 w-0.5 h-2.5 bg-primary/20 rounded-full" />

    {/* State 3: Modified display */}
    <CellStateRow label="Override active. Click ↺ to revert.">
      <span className="flex-1 inline-flex items-center gap-1 whitespace-nowrap">
        <span className="text-[10px] text-muted-foreground line-through">Rotating</span>
        <span className="text-[10px] text-muted-foreground">→</span>
        <span className="text-[10px] font-medium text-foreground/80">Day</span>
      </span>
      <RotateCcw className="h-3 w-3 text-muted-foreground ml-1" />
    </CellStateRow>
  </div>
);

/* ─── Comments Preview ─── */

const CommentsPreview = () => (
  <div className="rounded-lg border border-primary/20 bg-primary/[0.02] p-3 space-y-2 mt-1 shadow-sm ring-1 ring-primary/10">
    <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Activity &amp; Comments</p>

    {/* Activity log entry */}
    <div className="flex gap-2">
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Clock className="h-2.5 w-2.5 text-primary" />
        </div>
        <div className="w-px flex-1 bg-border mt-0.5" />
      </div>
      <div className="flex-1 pb-2">
        <div className="rounded-md bg-primary/5 border border-primary/15 px-2 py-1">
          <p className="text-[9px] text-primary font-medium">FTE Override Changed</p>
          <p className="text-[9px] text-foreground/70">Active FTE: 1.0 → 0.5 (LOA)</p>
          <p className="text-[8px] text-muted-foreground mt-0.5">Sarah M. · 2 hours ago</p>
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
          <p className="text-[9px] text-foreground/80">Expected to return mid-March. Backfill not needed.</p>
          <p className="text-[8px] text-muted-foreground mt-0.5">John D. · 1 hour ago</p>
        </div>
      </div>
    </div>

    {/* Composer bar */}
    <div className="flex items-center gap-1.5 rounded border border-border bg-background px-2 py-1 mt-1">
      <span className="text-[9px] text-muted-foreground/50 flex-1">Add a comment...</span>
      <Send className="h-3 w-3 text-muted-foreground" />
    </div>
  </div>
);

/* ─── Position Details Preview ─── */

const PositionDetailsPreview = () => {
  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-[7px] text-muted-foreground mb-0.5">{label}</p>
      <p className="text-[9px] font-medium text-foreground">{value}</p>
    </div>
  );

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/[0.02] p-3 space-y-2 mt-1 shadow-sm ring-1 ring-primary/10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-foreground">Abagayle Peaden</p>
          <p className="text-[8px] text-muted-foreground">RN-Pediatric ICU</p>
        </div>
        <span className="text-[7px] font-medium rounded-full px-1.5 py-0.5 bg-green-600 text-white">Active</span>
      </div>

      {/* Toggle bar */}
      <div className="flex items-center rounded-full border-2 border-primary p-0.5 gap-0.5">
        <span className="flex-1 text-center text-[8px] font-medium text-primary-foreground bg-primary rounded-full py-0.5">Details</span>
        <span className="flex-1 text-center text-[8px] font-medium text-foreground rounded-full py-0.5">Comments</span>
      </div>

      {/* Position Information */}
      <div className="bg-muted/50 rounded-lg p-2 space-y-1.5">
        <p className="text-[8px] font-semibold text-foreground">Position Information</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <Field label="Position Number" value="5963" />
          <Field label="Job Title" value="RN-Pediatric ICU" />
          <Field label="Job Code" value="801210" />
          <Field label="Job Family" value="Nursing" />
          <Field label="FTE" value="0.9" />
          <Field label="Shift" value="Rotating" />
          <Field label="Standard Hours" value="36" />
        </div>
      </div>

      {/* Employment Details */}
      <div className="bg-muted/50 rounded-lg p-2 space-y-1.5">
        <p className="text-[8px] font-semibold text-foreground">Employment Details</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <Field label="Employee Type" value="Regular" />
          <Field label="Employment Type" value="Full Time" />
          <Field label="Employment Flag" value="Active" />
          <Field label="Employee ID" value="10284756" />
        </div>
      </div>

      {/* Location */}
      <div className="bg-muted/50 rounded-lg p-2 space-y-1.5">
        <p className="text-[8px] font-semibold text-foreground">Location</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <Field label="Market" value="Indiana" />
          <Field label="Facility" value="St. Vincent Indianapolis" />
          <Field label="Department" value="Pediatric ICU" />
        </div>
      </div>

      {/* Close button */}
      <div className="flex justify-end pt-0.5">
        <span className="text-[8px] font-medium text-primary-foreground bg-primary px-3 py-1 rounded-full">Close</span>
      </div>
    </div>
  );
};

/* ─── Main Export ─── */

export function PositionsDemoPreview({ variant }: PositionsDemoPreviewProps) {
  switch (variant) {
    case 'active-fte-steps':
      return <ActiveFteStepsPreview />;
    case 'shift-override-steps':
      return <ShiftOverrideStepsPreview />;
    case 'comments-preview':
      return <CommentsPreview />;
    case 'position-details':
      return <PositionDetailsPreview />;
    default:
      return null;
  }
}
