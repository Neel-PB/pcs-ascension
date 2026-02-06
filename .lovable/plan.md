

# Add Comment Field to Active FTE Form

## Summary

When users update Active FTE values, they should be prompted to add an optional comment. This reuses the existing comment system (`useAddPositionComment`) that's already in place for the position comments section.

---

## Visual Flow

```text
┌─────────────────────────────────────────────────┐
│ Active FTE Popover                              │
├─────────────────────────────────────────────────┤
│ Status / Reason:  [Select dropdown]             │
│ Active FTE:       [0.8]                         │
│ Expiry Date:      [Mar 15, 2026]                │
│                                                 │
│ Comment (optional):                             │
│ ┌─────────────────────────────────────────────┐ │
│ │ Employee returning from LOA next month...  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [Revert]                            [Save]      │
└─────────────────────────────────────────────────┘
```

---

## Technical Changes

### File 1: `src/components/editable-table/cells/EditableFTECell.tsx`

**Add comment state and textarea field**

1. Add import for Textarea:
```typescript
import { Textarea } from '@/components/ui/textarea';
```

2. Add comment state:
```typescript
const [comment, setComment] = useState('');
```

3. Reset comment when popover opens (in `handleOpenChange`):
```typescript
setComment('');
```

4. Update the `onSave` prop interface to include optional comment:
```typescript
onSave: (data: {
  actual_fte: number | null;
  actual_fte_expiry: string | null;
  actual_fte_status: string | null;
  actual_fte_shared_with?: string | null;
  actual_fte_shared_fte?: number | null;
  actual_fte_shared_expiry?: string | null;
  comment?: string;  // NEW
}) => void | Promise<void>;
```

5. Add comment textarea (before the actions section, after the dynamic content area):
```typescript
{/* Comment field - appears after status is selected */}
<AnimatePresence mode="sync">
  {editStatus && (
    <motion.div
      key="comment-field"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ 
        opacity: { duration: 0.15 },
        height: { type: "spring", stiffness: 500, damping: 35 }
      }}
      className="space-y-1.5 mt-3 overflow-hidden"
    >
      <Label className="text-xs font-medium">
        Comment <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a note about this change..."
        className="min-h-[60px] text-xs resize-none"
        maxLength={500}
      />
    </motion.div>
  )}
</AnimatePresence>
```

6. Include comment in `handleSave`:
```typescript
const saveData = {
  // ... existing fields
  comment: comment.trim() || undefined,
};
await onSave(saveData);
```

---

### File 2: `src/pages/positions/EmployeesTab.tsx`

**Update the data type in handleActualFteUpdate callback**

```typescript
const handleActualFteUpdate = useCallback((
  id: string, 
  previousFte: number | null, 
  previousExpiry: string | null,
  previousStatus: string | null,
  data: {
    actual_fte: number | null;
    actual_fte_expiry: string | null;
    actual_fte_status: string | null;
    actual_fte_shared_with?: string | null;
    actual_fte_shared_fte?: number | null;
    actual_fte_shared_expiry?: string | null;
    comment?: string;  // NEW
  }
) => {
  updateActualFte.mutate({ 
    id, 
    ...data, 
    previousFte, 
    previousExpiry, 
    previousStatus 
  });
}, [updateActualFte]);
```

---

### File 3: `src/pages/positions/ContractorsTab.tsx`

**Same update as EmployeesTab**

Update `handleActualFteUpdate` data type to include optional `comment` field.

---

### File 4: `src/hooks/useUpdateActualFte.ts`

**Accept comment param and save it after FTE update**

1. Add comment to params interface:
```typescript
interface UpdateActualFteParams {
  // ... existing fields
  comment?: string;  // NEW
}
```

2. Import the existing `useAddPositionComment` hook:
```typescript
import { useAddPositionComment } from '@/hooks/usePositionComments';
```

3. Add the hook inside the main hook:
```typescript
const addComment = useAddPositionComment();
```

4. In `onSuccess`, after the activity log, add the user comment if provided:
```typescript
onSuccess: (updatedData) => {
  // ... existing cache update logic

  // Log activity with structured field details
  addActivityLog.mutate({
    positionId: updatedData.id,
    changeType: 'fte',
    fteDetails: { ... },
  });

  // NEW: Add user comment if provided
  if (updatedData.comment) {
    addComment.mutate({
      positionId: updatedData.id,
      content: updatedData.comment,
    });
  }

  toast.success('Active FTE updated successfully');
},
```

5. Pass `comment` through the mutation:
```typescript
mutationFn: async ({ 
  // ... existing params
  comment,  // NEW
}: UpdateActualFteParams) => {
  // ... existing update logic
  
  return { 
    ...data, 
    previousFte,
    previousExpiry,
    previousStatus,
    comment,  // NEW - pass through for onSuccess
  };
},
```

---

## User Flow After Changes

| Step | Action | Result |
|------|--------|--------|
| 1 | Click Active FTE cell | Popover opens |
| 2 | Select Status/Reason | FTE dropdown, expiry date, and comment field appear |
| 3 | Fill in FTE value and dates | Form is ready to save |
| 4 | (Optional) Type a comment | Text captured |
| 5 | Click Save | FTE updated, activity logged, comment saved if provided |
| 6 | View position comments panel | User comment appears alongside activity log entries |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/editable-table/cells/EditableFTECell.tsx` | Add comment state, textarea field, include in save data |
| `src/pages/positions/EmployeesTab.tsx` | Update handleActualFteUpdate type to accept comment |
| `src/pages/positions/ContractorsTab.tsx` | Update handleActualFteUpdate type to accept comment |
| `src/hooks/useUpdateActualFte.ts` | Accept comment param, use existing `useAddPositionComment` to save comment on success |

---

## Reused Existing Components

- **`Textarea`** from `@/components/ui/textarea` - consistent styling
- **`useAddPositionComment`** from `@/hooks/usePositionComments` - saves comment to `position_comments` table
- Comments will appear in the existing `PositionCommentSection` alongside activity logs

