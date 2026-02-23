

## Restructure Feedback Table with Combined Actions Column

### New Column Order (10 columns)
1. Title
2. Description (no "View page" link)
3. Author (plain text, no avatar)
4. Type (badge select)
5. ACS Status (renamed from PCS Status)
6. PB Status
7. Priority
8. Date
9. **Actions** (camera icon + comments icon with count + delete icon, all in one row)

### Changes

**`src/pages/feedback/FeedbackPage.tsx`**
- Reorder TableHead columns to match the order above
- Rename "PCS Status" to "ACS Status" in both header and filter dropdown
- Remove separate Screenshot, Comments, and Delete headers
- Add single "Actions" header (w-[130px])
- Adjust widths: Title min-w-[180px], Description min-w-[220px], Author w-[110px], Type w-[100px], ACS Status w-[120px], PB Status w-[110px], Priority w-[80px], Date w-[100px], Actions w-[130px]

**`src/components/feedback/FeedbackTableRow.tsx`**
- Reorder TableCell elements to match new column order
- **Description cell**: Remove the `page_url` / "View page" link
- **Author cell**: Remove Avatar component, show plain text name only
- **Actions cell**: Combine into one TableCell with a flex row containing:
  - Camera icon button (opens screenshot dialog if available, disabled/muted if none)
  - Comments icon button with count badge (opens comments dialog)
  - Delete trash icon button (opens confirm dialog)
- Remove unused imports: `Avatar`, `AvatarImage`, `AvatarFallback`, `ExternalLink`
- Replace screenshot thumbnail with just the camera icon; keep the Dialog for full-size view on click

### Technical Detail -- Actions Cell Layout

```text
+-------------------------------+
| [Camera] [Comments 3] [Trash] |
+-------------------------------+
```

All three icons are ghost buttons in a `flex items-center gap-1` container. The comments button shows the count as a small badge/number next to the icon.

