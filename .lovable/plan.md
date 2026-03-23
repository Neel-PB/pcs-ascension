

## Add User Name & Email to Google Chat Webhook Payload

### Change

**`src/pages/support/SupportPage.tsx`**

1. Import `useAuth` from `@/hooks/useAuth`
2. Call `const { user } = useAuth()` in the component
3. Update the webhook payload text to include reporter info:

```
text: `🚨 *New Issue Reported*\n\n*Reporter:* ${user?.firstName} ${user?.lastName} (${user?.email})\n*Title:* ${issueTitle}\n*Description:* ${issueDescription}\n*Submitted:* ${timestamp}`
```

Single-line change to the payload string, plus adding the hook import and call.

