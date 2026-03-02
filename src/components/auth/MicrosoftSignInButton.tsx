import { Button } from "@/components/ui/button";
import { Loader2 } from "@/lib/icons";

interface MicrosoftSignInButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function MicrosoftSignInButton({ onClick, isLoading, disabled }: MicrosoftSignInButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 gap-3 font-medium"
      onClick={onClick}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 21">
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
      )}
      {isLoading ? "Signing in..." : "Sign in with Microsoft"}
    </Button>
  );
}
