

## Fix Feedback Table Padding, PB Status Default, Description Tooltip, and Styling

### Issues Found
1. **Padding mismatch**: Header cells use `px-4` padding (from `DraggableColumnHeader`), but most feedback `renderCell` functions render raw `<span>` or `<Select>` elements without matching `px-4` padding. The Positions module cells use `CellButton` which provides `px-4 py-2` -- feedback columns skip this.
2. **PB Status missing "Pending"**: The `pbStatusConfig` only has `in_progress`, `resolved`, `closed` -- no `pending` option. New feedback rows likely have `pb_status = 'in_progress'` by default, but you want `pending` as the default.
3. **Description tooltip**: Currently a plain `<span>` with `line-clamp-2`. Needs a tooltip for long content, matching the `TruncatedTextCell` pattern used by Title.
4. **Styling consistency**: Badge colors and Select trigger styles should follow the app's established patterns (Ascension brand blue for primary states, consistent `rounded-lg` selects per Helix reference).

### Changes

**`src/config/feedbackColumns.tsx`**

1. **Add `pending` to `pbStatusConfig`**:
   - Add entry: `pending: { label: 'Pending', color: 'bg-blue-500/10 text-blue-600' }`
   - This ensures new feedback with `pb_status = 'pending'` renders correctly

2. **Description column** -- wrap in `TruncatedTextCell` with tooltip:
   - Replace raw `<span className="line-clamp-2">` with `TruncatedTextCell` (same component used by Title column)
   - This provides automatic tooltip on hover for lengthy descriptions

3. **Wrap non-interactive cells with `px-4` padding**:
   - **Author cell**: Wrap the name `<span>` inside a `div` with `px-4` to match header padding
   - **Type, ACS Status, PB Status, Priority cells**: Add `px-4` to the outer wrapper of each Select so the badge/text aligns with the column header
   - **Date cell**: Wrap in a `div` with `px-4`
   - **Actions cell**: Add `px-4` to the flex container

4. **Apply app color/style conventions**:
   - Use `rounded-lg` on Select triggers per Helix component reference
   - Use brand-aligned badge colors matching existing app patterns (primary/10 for active states)

### Technical Detail

The core padding fix is adding `px-4` to each `renderCell` return since the `DraggableColumnHeader` already uses `px-4`, and cells rendered via `CellButton` (like `TruncatedTextCell`) also use `px-4`. The feedback-specific cells (Select dropdowns, raw spans, action buttons) currently skip this, causing visual misalignment.

### Files Changed
- `src/config/feedbackColumns.tsx` (all changes in this single file)
