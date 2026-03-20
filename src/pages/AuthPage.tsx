import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "@/lib/icons";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import DemoLogin from "@/components/auth/DemoLogin";
import { Separator } from "@/components/ui/separator";
import MicrosoftSignInButton from "@/components/auth/MicrosoftSignInButton";

const ALLOWED_EMAIL_DOMAINS = ['@ascension.org', '@ascension-external.org', '@particleblack.com'];

const signUpEmailSchema = z.string().email('Invalid email address').refine(
  (email) => ALLOWED_EMAIL_DOMAINS.some(domain => email.toLowerCase().endsWith(domain)),
  { message: `Email must end with ${ALLOWED_EMAIL_DOMAINS.join(', ')}` }
);

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithMicrosoft, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isMsalLoading, setIsMsalLoading] = useState(false);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  if (user || msalUser) {
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(signInEmail, signInPassword);
      if (!error) navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation = signUpEmailSchema.safeParse(signUpEmail);
    if (!emailValidation.success) {
      toast.error(emailValidation.error.errors[0].message);
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await signUp(signUpEmail, signUpPassword, firstName, lastName);
      if (!error) navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsMsalLoading(true);
    try {
      const { error } = await signInWithMicrosoft();
      if (!error) navigate("/");
    } finally {
      setIsMsalLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-auto flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Position Control Dashboard
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to access your workforce network
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Microsoft Sign-In */}
              <MicrosoftSignInButton onClick={handleMicrosoftSignIn} isLoading={isMsalLoading} disabled={isLoading} />

              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  or
                </span>
              </div>

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input id="signin-email" type="email" placeholder="you@example.com" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input id="signin-password" type="password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} required disabled={isLoading} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input id="first-name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input id="last-name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" placeholder="you@ascension.org" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} required disabled={isLoading} />
                      <p className="text-xs text-muted-foreground">Only @ascension.org, @ascension-external.org, or @particleblack.com emails allowed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} required disabled={isLoading} minLength={6} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>) : "Sign Up"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <DemoLogin />
        </div>
      </motion.div>
    </div>
  );
}
