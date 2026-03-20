

## Problem

The KPI card content (title + value) is top-aligned within the card, causing visible extra space at the bottom. The action icons are anchored to `bottom-3` instead of being vertically centered, adding to the visual imbalance.

## Root Cause

In `KPICard.tsx` (line 96), `CardContent` uses `p-4 pr-10` which gives equal top/bottom padding, but the content itself just flows from top-down without vertical centering. The icons are positioned at `bottom-3` instead of `top-1/2 -translate-y-1/2` (which the `KPICardGroup` variant correctly uses).

## Fix

**File: `src/components/staffing/KPICard.tsx`**

1. Change the action icons positioning from `right-4 bottom-3` to `right-4 top-1/2 -translate-y-1/2` (line 103) — this matches how `KPICardGroup`'s `SingleCardInGroup` already positions its icons.

2. Add vertical centering to `CardContent` by adding `flex flex-col justify-center` and a consistent min-height so all cards align uniformly, regardless of whether they have trend values.

This is a CSS-only change affecting one file, ensuring the title, value, and icons all sit vertically centered within the card.

