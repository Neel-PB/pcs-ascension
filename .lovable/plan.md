

# Combine Activity Logs with Associated Comments

## Overview

When a user changes FTE/Shift status and adds a comment in the popover, the comment should be displayed **inside the same activity card** rather than as a separate comment entry. Standalone comments (added via the comment composer at the bottom) will remain as separate entries.

---

## Current vs. Proposed Behavior

```text
CURRENT (Two separate entries):
┌───────────────────────────────────────────────────────┐
│  FTE Change                                           │
│  ┌────────────────────────────────┐                   │
│  │ FTE: 0 → 0.9                   │                   │
│  │ REASON: — → MILITARY_LEAVE     │                   │
│  │ EXPIRY: — → Apr 17, 2026       │                   │
│  │              by Maurizio Virone│                   │
│  └────────────────────────────────┘                   │
│  less than a minute ago                               │
│                                                       │
│  Demo Admin                          ← SEPARATE ENTRY │
│  ┌────────────────────────────────┐                   │
│  │ Adding FMLA to be .4           │                   │
│  └────────────────────────────────┘                   │
│  less than a minute ago                               │
└───────────────────────────────────────────────────────┘

PROPOSED (Comment inside activity card):
┌───────────────────────────────────────────────────────┐
│  FTE Change                                           │
│  ┌────────────────────────────────┐                   │
│  │ FTE: 0 → 0.9                   │                   │
│  │ REASON: — → MILITARY_LEAVE     │                   │
│  │ EXPIRY: — → Apr 17, 2026       │                   │
│  │                                │                   │
│  │ "Adding FMLA to be .4"         │  ← INSIDE CARD   │
│  │              by Maurizio Virone│                   │
│  └────────────────────────────────┘                   │
│  less than a minute ago                               │
│                                                       │
│  Demo Admin                          ← STANDALONE     │
│  ┌────────────────────────────────┐    (separate)     │
│  │ Manual follow-up comment       │                   │
│  └────────────────────────────────┘                   │
└───────────────────────────────────────────────────────┘
```

---

## Technical Changes

### 1. Update `useAddActivityLog.ts` - Accept Optional Comment

Add a `comment` field to the parameters and store it in metadata:

**File:** `src/hooks/useAddActivityLog.ts`

```typescript
interface ActivityLogParams {
  positionId: string;
  changeType: 'fte' | 'shift';
  fteDetails?: FteChangeDetails;
  shiftDetails?: ShiftChangeDetails;
  comment?: string;  // NEW: Optional comment to include with activity
}

// Inside mutationFn, add comment to metadata:
if (changeType === 'fte' && fteDetails) {
  content = 'FTE Change';
  metadata = {
    type: 'fte',
    fte_old: fteDetails.fte_old,
    fte_new: fteDetails.fte_new,
    reason_old: fteDetails.reason_old,
    reason_new: fteDetails.reason_new,
    expiry_old: fteDetails.expiry_old,
    expiry_new: fteDetails.expiry_new,
    comment: comment || null,  // NEW: Store comment in metadata
  };
}
```

---

### 2. Update `useUpdateActualFte.ts` - Pass Comment to Activity Log

Instead of creating a separate comment entry, pass the comment to `addActivityLog`:

**File:** `src/hooks/useUpdateActualFte.ts`

```typescript
// BEFORE (lines 108-114):
if (updatedData.comment) {
  addComment.mutate({
    positionId: updatedData.id,
    content: updatedData.comment,
  });
}

// AFTER - Pass comment to addActivityLog instead:
addActivityLog.mutate({
  positionId: updatedData.id,
  changeType: 'fte',
  fteDetails: { ... },
  comment: updatedData.comment,  // Pass comment here
});
// Remove the separate addComment.mutate() call
```

---

### 3. Update `FteActivityCard` Component - Display Comment

Add a comment section to the FTE activity card:

**File:** `src/components/positions/PositionCommentSection.tsx`

```typescript
function FteActivityCard({ metadata, displayName }: { ... }) {
  const fteOld = metadata.fte_old as number | null;
  // ... existing fields
  const comment = metadata.comment as string | null;  // NEW

  return (
    <div className="divide-y divide-border/30">
      <ActivityFieldRow label="FTE" oldValue={fteOld} newValue={fteNew} />
      <ActivityFieldRow label="Reason" oldValue={reasonOld} newValue={reasonNew} isMultiline />
      <ActivityFieldRow label="Expiry" oldValue={formattedExpiryOld} newValue={formattedExpiryNew} />
      
      {/* NEW: Display comment if present */}
      {comment && (
        <div className="pt-3 pb-1">
          <p className="text-sm text-foreground italic">"{comment}"</p>
        </div>
      )}
      
      <div className="flex justify-end pt-2">
        <span className="text-xs text-muted-foreground">by {displayName}</span>
      </div>
    </div>
  );
}
```

---

### 4. Update Shift Activity (Optional)

If shift changes can also have comments, apply the same pattern to `useUpdateShiftOverride.ts` and `ShiftActivityCard`.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useAddActivityLog.ts` | Add optional `comment` parameter, store in metadata |
| `src/hooks/useUpdateActualFte.ts` | Pass comment to `addActivityLog` instead of creating separate entry, remove `addComment` import if no longer needed |
| `src/components/positions/PositionCommentSection.tsx` | Display comment inside `FteActivityCard` component |

---

## Notes

- Existing activity logs without comments will continue to work (null/undefined comment)
- New activity logs with comments will display the comment inside the card
- Standalone comments added via the composer remain separate entries
- This keeps the timeline cleaner by grouping related information together

