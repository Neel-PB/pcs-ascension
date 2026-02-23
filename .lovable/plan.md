

## Migrate Feedback Table to EditableTable Component

### Goal
Replace the manual HTML `Table`/`TableRow`/`TableCell` implementation in the Feedback page with the same `EditableTable` component used in the Positions module (Employees, Contractors, Requisitions tabs). This gives the feedback table virtualization, column reordering, proportional scaling, sticky headers, zebra striping, and visual consistency.

### Approach

**1. Create `src/config/feedbackColumns.tsx`** -- Column definitions file (mirrors `employeeColumns.tsx` pattern)

Define a `ColumnDef<Feedback>[]` array with 9 columns in order:

| # | id | label | type | width | minWidth | Cell Rendering |
|---|-----|-------|------|-------|----------|----------------|
| 1 | title | Title | custom | 180 | 160 | TruncatedTextCell, line-clamp-1 |
| 2 | description | Description | custom | 240 | 200 | TruncatedTextCell, line-clamp-2, muted text |
| 3 | author | Author | custom | 120 | 100 | Plain text from author.first_name + last_name |
| 4 | type | Type | custom | 110 | 100 | Badge with icon + inline Select (bug/feature/improvement/question) |
| 5 | pcs_status | ACS Status | custom | 120 | 110 | Badge + inline Select (pending/approved/disregard/backlog) |
| 6 | pb_status | PB Status | custom | 120 | 110 | Badge + inline Select (in_progress/resolved/closed), locked logic |
| 7 | priority | Priority | custom | 90 | 80 | Colored text + inline Select (low/medium/high) |
| 8 | created_at | Date | custom | 110 | 90 | Formatted date (relative if < 24h) |
| 9 | actions | Actions | custom | 130 | 130 | Camera icon + Comments dialog + Delete dialog in flex row |

- `title` column will be locked (first column, cannot be hidden)
- All columns will be `sortable: false` initially (sorting is handled externally already), except title/date which can be sortable
- Export a `createFeedbackColumns(handlers)` function that takes callbacks for type/status/priority changes, delete, and screenshot resolution -- similar to `createEmployeeColumnsWithComments`

**2. Update `src/pages/feedback/FeedbackPage.tsx`**

- Remove imports: `Table`, `TableBody`, `TableHead`, `TableHeader`, `TableRow`
- Remove the `FeedbackTableRow` import
- Add import: `EditableTable` from `@/components/editable-table/EditableTable`
- Add import: `createFeedbackColumns` from `@/config/feedbackColumns`
- Add sort state (`sortColumn`, `sortDirection`, `handleSort`) like in EmployeesTab
- Build columns using `createFeedbackColumns(...)` with handlers from `useFeedback()`
- Replace the manual `<Table>` block with:
  ```
  <EditableTable
    columns={feedbackColumns}
    data={filteredFeedback}
    getRowId={(row) => row.id}
    sortField={sortColumn}
    sortDirection={sortDirection}
    onSort={handleSort}
    storeNamespace="feedback-columns-v1"
    className="min-h-0 max-h-full"
  />
  ```
- Keep the existing filter bar (SearchField + Select dropdowns) unchanged above the table

**3. Move interactive cell logic from `FeedbackTableRow` into column `renderCell` functions**

Each interactive cell (Type select, ACS Status select, PB Status select, Priority select, Actions group) will be rendered via `renderCell` in the column config, using the same component markup currently in `FeedbackTableRow`. The handlers (updatePcsStatus, updatePbStatus, etc.) will be passed as closures from the page via `createFeedbackColumns`.

**4. `FeedbackTableRow.tsx` can be deleted** (no longer needed)

All its rendering logic moves into the column definitions in `feedbackColumns.tsx`.

### What You Get
- Identical look and behavior to the Positions Employee table
- Virtualized rendering for performance with large feedback lists
- Column drag-to-reorder
- Proportional column scaling on wide screens
- Sticky header with zebra-striped rows
- Consistent rounded-xl container with shadow styling
- Column visibility/width persistence via localStorage

### Files Changed
- **New**: `src/config/feedbackColumns.tsx`
- **Modified**: `src/pages/feedback/FeedbackPage.tsx`
- **Deleted**: `src/components/feedback/FeedbackTableRow.tsx`
