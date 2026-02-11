

# Migrate from Lucide Icons to Material Icons

## Overview

Replace all Lucide React icons with Google Material Icons using the `react-icons` library (`react-icons/md`). This aligns the app with Ascension's Material Icons design system.

## Approach: Centralized Icon Adapter

Create a single mapping file (`src/lib/icons.ts`) that re-exports Material icons using the existing Lucide names. This means:
- Only **1 new file** is created
- All **44 existing files** just change their import path (from `'lucide-react'` to `'@/lib/icons'`)
- No JSX changes needed -- component names stay the same

## Step 1: Install `react-icons`

Add `react-icons` as a dependency. This is a lightweight, tree-shakable library with Material Design icons under `react-icons/md`.

## Step 2: Create `src/lib/icons.ts`

A central mapping file that:
- Re-exports each Material icon with its Lucide alias name
- Exports a `LucideIcon` type alias pointing to `IconType` from `react-icons` (for backward compatibility with interfaces in 7 files)

### Complete Icon Mapping

| Lucide Name | Material Icon | Used In |
|---|---|---|
| AlertCircle | MdErrorOutline | volumeOverrideColumns, BadgeWithEditableValue |
| AlertTriangle | MdWarning | ForecastChecklistPositionDetail |
| ArrowDown | MdArrowDownward | DraggableColumnHeader |
| ArrowUp | MdArrowUpward | DraggableColumnHeader |
| AudioWaveform | MdGraphicEq | VoiceRecorder |
| BarChart3 | MdBarChart | KPICard, WorkforceKPICard |
| Bell | MdNotifications | AppHeader, BellIndicatorCell |
| Brain | MdPsychology | Reasoning |
| Building2 | MdBusiness | VolumeOverrideSettings, WorkforceDrawer |
| Calendar | MdCalendarToday | LookerReportHeader |
| Camera | MdCameraAlt | UISettings, ScreenshotCapture |
| Check | MdCheck | Actions, ChatMessage, MarkdownRenderer, etc. |
| ChevronDown | MdExpandMore | multiple files |
| ChevronRight | MdChevronRight | multiple files |
| ChevronUp | MdExpandLess | PillChatBar |
| Copy | MdContentCopy | Actions, ChatMessage, MarkdownRenderer |
| Database | MdStorage | NPSettingsTab |
| Download | MdDownload | LookerReportHeader |
| Edit2 | MdEdit | VolumeOverrideSettings |
| ExternalLink | MdOpenInNew | InlineCitation, FeedbackDetailsSheet |
| Eye | MdVisibility | KPICard, WorkforceKPICard |
| EyeOff | MdVisibilityOff | DraggableColumnHeader |
| FileBarChart | MdInsertChart | AppSidebar, AIWelcomeCards |
| FileSearch | MdFindInPage | PillChatBar |
| FileSpreadsheet | MdTableChart | PillChatBar |
| FileText | MdDescription | PillChatBar |
| Filter | MdFilterList | LookerReportHeader |
| Globe | MdLanguage | VolumeOverrideSettings, FeedbackDetailsSheet |
| Image | MdImage | PillChatBar, FeedbackDetailsSheet |
| Info | MdInfo | KPICard, DraggableColumnHeader |
| LifeBuoy | MdHelp | AppSidebar |
| Loader2 | MdSync | FeedbackTrigger, FeedbackForm, ImportProgress |
| Maximize2 | MdFullscreen | DraggableColumnHeader |
| Menu | MdMenu | PillChatBar |
| MessageSquare | MdChat | AppSidebar, FeedbackPage, contractorColumns |
| MessageSquarePlus | MdAddComment | FeedbackTrigger |
| MessageSquareText | MdSms | CommentIndicatorCell |
| Monitor | MdMonitor | AppHeader, FeedbackDetailsSheet |
| Moon | MdDarkMode | AppHeader |
| Navigation | MdNavigation | UISettings |
| Paperclip | MdAttachFile | ChatMessage, PillChatBar |
| Pencil | MdEdit | multiple files |
| Plus | MdAdd | PillChatBar |
| RefreshCcw | MdRefresh | Actions |
| RefreshCw | MdRefresh | LookerReportHeader, ForecastChecklistDeptSkillGroup |
| RotateCcw | MdUndo | DraggableColumnHeader, EditableDateCell, etc. |
| RotateCw | MdRedo | AvatarUploadCrop |
| Save | MdSave | UISettings, VolumeOverrideSettings |
| Search | MdSearch | AppHeader, FeedbackPage |
| Send | MdSend | FeedbackForm, FeedbackDetailsSheet, FeedbackCommentsDialog |
| Share2 | MdShare | LookerReportHeader |
| ShieldAlert | MdGppBad | volumeOverrideColumns |
| ShieldCheck | MdVerifiedUser | AppSidebar, volumeOverrideColumns, npOverrideColumns |
| Sparkles | MdAutoAwesome | AIHubTrigger, AIWelcomeCards |
| Square | MdStop | VoiceRecorder, PillChatBar |
| Sun | MdLightMode | AppHeader |
| ThumbsDown | MdThumbDown | Actions |
| ThumbsUp | MdThumbUp | Actions |
| Trash2 | MdDelete | multiple files |
| TrendingDown | MdTrendingDown | LookerMetricCard |
| TrendingUp | MdTrendingUp | AppSidebar, AIWelcomeCards, LookerMetricCard |
| Upload | MdUpload | ScreenshotCapture, AvatarUploadCrop |
| UserCog | MdManageAccounts | AppSidebar, WorkforceDrawerTrigger |
| Users | MdPeople | AppSidebar, AIWelcomeCards, RecipientMultiSelect |
| X | MdClose | PillChatBar, ScreenshotCapture, OverrideVolumeCell |
| CheckCircle2 | MdCheckCircle | ImportProgress |

## Step 3: Update All 44 Files

Change every import from:
```ts
import { Users, Search } from 'lucide-react';
```
to:
```ts
import { Users, Search } from '@/lib/icons';
```

Also change `type { LucideIcon }` imports in 7 files to import from `@/lib/icons`.

## Step 4: Remove `stroke-[1.5]` Classes

A few components (notably `AppSidebar.tsx`) apply `stroke-[1.5]` to icons. Material icons are filled, not stroked, so these classes will be removed.

## Step 5: Handle `Loader2` Spin Animation

Lucide's `Loader2` is commonly used with `animate-spin`. Material's `MdSync` will work with the same animation class.

## Step 6: Uninstall `lucide-react`

Remove the dependency once all imports are migrated.

## Visual Impact

- Material icons are **filled** by default vs Lucide's **outline/stroke** style
- Icons will appear slightly bolder and more consistent with Ascension's design system
- Sizing via `className="h-5 w-5"` continues to work with `react-icons`

## Files Changed Summary

- **1 new file**: `src/lib/icons.ts`
- **44 files updated**: import path change only
- **~3 files**: remove `stroke-[1.5]` class
- **tailwind.config.ts / package.json**: dependency swap

