import { Configuration, LogLevel } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_MSAL_CLIENT_ID || "YOUR_CLIENT_ID_HERE";
const tenantId = import.meta.env.VITE_MSAL_TENANT_ID || "YOUR_TENANT_ID_HERE";

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin + "/auth",
    postLogoutRedirectUri: window.location.origin + "/auth",
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error("[MSAL]", message);
      },
      logLevel: LogLevel.Error,
      piiLoggingEnabled: false,
    },
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};
