

## Add Report Issue Trigger Button & Remove Tab from Support

### Changes

**1. Create `src/components/feedback/ReportIssueTrigger.tsx`**
- A fixed-position button placed just below the AI Hub trigger (`bottom-[116px]` to stack above its `bottom-[68px]`).
- Same visual style as AIHubTrigger: slim pill hugging the right edge, rounded-l-xl.
- Uses a `Bug` or `AlertCircle` icon.
- On click, opens a Sheet (side drawer) containing the Report Issue form.
- The sheet contains the same form logic currently in SupportPage: title input, description textarea, submit via Google Chat webhook.
- Self-contained component with its own state for the sheet open/close, form fields, and submission.

**2. Mount in `src/components/shell/ShellLayout.tsx`**
- Import and render `<ReportIssueTrigger />` alongside the existing layout, so it's globally available on every page.

**3. Clean up `src/pages/support/SupportPage.tsx`**
- Remove `{ id: "report", label: "Report Issue" }` from the `tabs` array.
- Remove the `{activeTab === "report" && ...}` render block (lines 173-208).
- Remove now-unused state (`issueTitle`, `issueDescription`, `isSubmitting`) and the `handleSubmitIssue` function.
- Remove unused imports (`FileText`, `ExternalLink`, `Input`, `Textarea`) if no longer referenced.

