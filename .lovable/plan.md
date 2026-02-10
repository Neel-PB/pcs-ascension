

# Fix Gap Between Input and Check/Cancel Buttons in Override NP % Cell

## Problem

In editing mode, the `justify-between` layout pushes the input field to the left and the check/X buttons to the right, creating an unnatural gap between them. They should sit next to each other.

## Fix

In `src/components/editable-table/cells/OverrideVolumeCell.tsx`, change the editing state to group the input and buttons together using `gap-2` instead of spreading them with `justify-between`. The outer wrapper keeps `justify-between` for idle and saved states, but the editing content will be wrapped in a single group.

Specifically, wrap the editing-state input and buttons in a `flex items-center gap-1` container so they sit adjacent, rather than being direct children of the `justify-between` parent.

