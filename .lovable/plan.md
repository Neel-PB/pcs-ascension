
# Redesign UserFormSheet to Match App-Wide Sheet Layout

## Problem

The UserFormSheet (Add User / Edit User) uses the default Shadcn sheet width (`sm:max-w-sm` = 384px) and a simple layout, while all other detail sheets in the app (Employee, Contractor, Requisition, Feedback) use a consistent wider layout (`sm:max-w-xl` = 576px) with:
- Fixed header aligned to the global header height
- Flexible content area with ScrollArea
- Fixed footer with action buttons
- Hidden default close button

## Solution

Redesign UserFormSheet to match the established pattern used throughout the application.

---

## Technical Changes

### File: `src/components/admin/UserFormSheet.tsx`

#### Change 1: Update SheetContent width and layout structure

```typescript
// BEFORE (line 131-132):
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent className="overflow-y-auto">

// AFTER:
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent 
    className="w-full sm:max-w-xl flex h-full flex-col p-0" 
    hideCloseButton
  >
```

#### Change 2: Replace SheetHeader with custom fixed header

```typescript
// BEFORE (lines 133-140):
<SheetHeader>
  <SheetTitle>{isEditMode ? 'Edit User' : 'Invite New User'}</SheetTitle>
  <SheetDescription>
    {isEditMode
      ? 'Update user information and roles'
      : 'Send an invitation email to create a new user account'}
  </SheetDescription>
</SheetHeader>

// AFTER:
<div
  className="shrink-0 px-6 border-b border-border flex flex-col justify-center"
  style={{ height: 'var(--header-height)' }}
>
  <h2 className="text-lg font-semibold">
    {isEditMode ? 'Edit User' : 'Invite New User'}
  </h2>
  <p className="text-sm text-muted-foreground">
    {isEditMode
      ? 'Update user information and roles'
      : 'Send an invitation email to create a new user account'}
  </p>
</div>
```

#### Change 3: Wrap form content in ScrollArea for flexible scrolling

```typescript
// BEFORE (lines 142-258):
<Form {...form}>
  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
    {/* Form fields */}
    <div className="flex gap-3 pt-4">
      {/* Buttons */}
    </div>
  </form>
</Form>

// AFTER:
<Form {...form}>
  <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 min-h-0">
    {/* Scrollable Content Area */}
    <ScrollArea className="flex-1">
      <div className="px-6 py-6 space-y-6">
        {/* All FormFields go here */}
        {/* Access Scope Collapsible goes here */}
      </div>
    </ScrollArea>
    
    {/* Fixed Footer */}
    <div className="shrink-0 px-6 py-4 border-t border-border bg-background">
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Sending...' : isEditMode ? 'Update' : 'Send Invite'}
        </Button>
      </div>
    </div>
  </form>
</Form>
```

#### Change 4: Add ScrollArea import

```typescript
// Add to imports:
import { ScrollArea } from "@/components/ui/scroll-area";
```

#### Change 5: Remove unused SheetDescription import

```typescript
// BEFORE:
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// AFTER:
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
```

---

## Visual Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Width | 384px (sm:max-w-sm) | 576px (sm:max-w-xl) |
| Header | Basic SheetHeader | Fixed header matching global height |
| Scrolling | Entire sheet scrolls | Only content area scrolls |
| Footer | Scrolls with content | Fixed at bottom |
| Close button | Default X in corner | Integrated Cancel button |

---

## Consistency Benefits

- Matches Employee, Contractor, Requisition, and Feedback detail sheets
- Aligns header height with global `--header-height` CSS variable
- Provides more horizontal space for form fields and Access Scope manager
- Fixed footer ensures action buttons are always visible
- Consistent visual language across the admin module
