import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function DemoLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await signIn("demo@ascension.org", "demo123");
      if (!error) {
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Demo Access</CardTitle>
        </div>
        <CardDescription>
          Quick access for testing and demonstration purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full"
          size="lg"
          variant="ascension"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Login as Admin
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Admin credentials • Full system access
        </p>
      </CardContent>
    </Card>
  );
}
