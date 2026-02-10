

# Increase Override NP % Input Width to Follow Row Pattern

## Problem

The inline number input in `OverrideVolumeCell` uses a fixed `w-20` (80px) width, which looks narrow compared to the column width. The input should expand to fill available space, matching how other cells use the full row width.

## Fix

In `src/components/editable-table/cells/OverrideVolumeCell.tsx`, change the input from `w-20` to `flex-1` so it stretches to fill the remaining space within the editing container, minus the check/X buttons.

**Line ~133 change:**
- From: `className="w-20 text-sm font-medium bg-background border border-input rounded px-2 py-1 focus:outline-none"`
- To: `className="flex-1 min-w-0 text-sm font-medium bg-background border border-input rounded px-2 py-1 focus:outline-none"`

This single class change makes the input expand naturally within the `flex gap-1` container while the buttons stay their fixed size on the right.

