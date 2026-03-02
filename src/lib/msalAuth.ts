import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "@/config/msalConfig";

let msalInstance: PublicClientApplication | null = null;

export async function getMsalInstance(): Promise<PublicClientApplication> {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
  }
  return msalInstance;
}

export interface MsalLoginResult {
  idToken: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
}

export async function loginWithMicrosoft(): Promise<MsalLoginResult> {
  const instance = await getMsalInstance();

  try {
    const response = await instance.loginPopup(loginRequest);

    const claims = response.idTokenClaims as Record<string, string>;

    return {
      idToken: response.idToken,
      email: claims.preferred_username || claims.email || "",
      firstName: claims.given_name || "",
      lastName: claims.family_name || "",
      name: claims.name || "",
    };
  } catch (error) {
    // If popup is blocked, fall back to redirect
    if (error instanceof InteractionRequiredAuthError || (error as any)?.errorCode === "popup_window_error") {
      await instance.loginRedirect(loginRequest);
      // This will redirect, so we won't reach here
      throw new Error("Redirecting to Microsoft login...");
    }
    throw error;
  }
}
