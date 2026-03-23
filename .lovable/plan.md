

## Integrate Report Issue with Google Chat (Direct Webhook)

### Summary
When a user submits an issue from the "Report Issue" tab, the form will POST directly to the Google Chat webhook URL from the client side. No backend function needed.

### Changes

#### `src/pages/support/SupportPage.tsx`
- Hardcode the Google Chat webhook URL as a constant
- Update `handleSubmitIssue` to:
  1. POST a formatted card message to the webhook with issue title, description, and timestamp
  2. Add loading state to the submit button
  3. Show success/error toast based on the response
- Google Chat webhooks accept `{ text: "..." }` via simple POST — no auth needed

### Note
The webhook URL will be visible in the client-side JavaScript bundle. Incoming webhooks are low-risk (they can only post messages to the space, not read), but be aware anyone inspecting the code could use the URL to post messages.

**You'll need to provide the Google Chat webhook URL** so I can hardcode it in the component.

