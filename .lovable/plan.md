

## Use Outlined Icons for Feedback Actions

### What Changes

**`src/lib/icons.ts`** -- Add two new outlined icon exports:
- `MdOutlineCameraAlt as CameraOutline` (outlined camera)
- `MdOutlineDeleteOutline as Trash2Outline` (outlined trash)

These are added as new exports so existing components using the filled variants are not affected.

**`src/config/feedbackColumns.tsx`** -- Switch the Actions column icons:
- Camera icon: Import and use `CameraOutline` instead of `Camera`
- Comments icon: Already outlined (uses `MessageSquare` which maps to `MdOutlineChatBubbleOutline`) -- no change needed
- Delete icon: Import and use `Trash2Outline` instead of `Trash2`

### Files Changed
- `src/lib/icons.ts` (add 2 new outlined exports)
- `src/config/feedbackColumns.tsx` (swap Camera and Trash2 imports to outlined variants)

