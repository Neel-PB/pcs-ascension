

## Fix: Table Not Scrolling - Missing `h-full` in EditableTable

### Problem
The height chain is broken inside `EditableTable.tsx`. The parent containers (`SettingsTab` / `NPSettingsTab`) correctly constrain height with `flex-1 min-h-0 overflow-hidden`, but the `EditableTable` root div has no height directive -- it just uses `overflow-hidden` without `h-full`, so it collapses to content height and the virtualizer scroll area never activates.

### Solution
One single change in `src/components/editable-table/EditableTable.tsx`, line 214:

Add `h-full` to the root container div so it fills the height-constrained parent:

```
Before: "flex flex-col rounded-lg border bg-card shadow-sm overflow-hidden"
After:  "flex flex-col h-full rounded-lg border bg-card shadow-sm overflow-hidden"
```

This completes the height chain: page tab container (fixed height) -> table wrapper (`flex-1 min-h-0`) -> EditableTable root (`h-full flex flex-col`) -> inner scroll area (`flex-1 min-h-0`) -> VirtualizedTableBody (scroll activates).

No other files need changes.
