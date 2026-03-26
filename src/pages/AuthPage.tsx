import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, AlertCircle, Mail, Lock } from "@/lib/icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import AuthBg from "@/assets/auth-bg.png";

type AuthStep = "email" | "unauthorized" | "password" | "setup";

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, checkEmail, setInitialPassword, user } = useAuth();

  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (user) return null;

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const { exists, registered } = await checkEmail(email.trim());
      if (!exists) {
        setStep("unauthorized");
      } else if (registered) {
        setStep("password");
      } else {
        setStep("setup");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (!error) navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await setInitialPassword(email, password);
      if (!error) navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep("email");
    setPassword("");
    setConfirmPassword("");
  };

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="h-screen w-full bg-muted/30 p-4">
      <div className="flex h-full w-full rounded-2xl overflow-hidden shadow-lg bg-background">
        {/* Left: Background image */}
        <div
          className="hidden lg:block lg:w-1/2 bg-cover bg-bottom"
          style={{ backgroundImage: `url(${AuthBg})` }}
        />

        {/* Right: Form */}
        <div className="w-full lg:w-1/2 flex items-start justify-center pt-[25vh] bg-background p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-foreground text-center mb-8">
            Position Control
          </h1>

          {/* Back button for non-email steps */}
          {step !== "email" && (
            <Button variant="ghost" size="sm" onClick={goBack} className="mb-4 -ml-2 text-muted-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          )}

          <AnimatePresence mode="wait">
            {/* Step: Email */}
            {step === "email" && (
              <motion.form key="email" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} onSubmit={handleCheckEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking...</> : "Continue"}
                </Button>
              </motion.form>
            )}

            {/* Step: Unauthorized */}
            {step === "unauthorized" && (
              <motion.div key="unauthorized" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-medium">
                    <AlertCircle className="h-5 w-5" />
                    You are not authorized
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The email <span className="font-medium text-foreground">{email}</span> is not registered in the system.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please contact{" "}
                    <a href="mailto:pcssupport@particleblack.com" className="text-primary underline underline-offset-2">
                      pcssupport@particleblack.com
                    </a>{" "}
                    for access.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step: Password (registered user) */}
            {step === "password" && (
              <motion.form key="password" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="pl-10" autoFocus />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : "Sign In"}
                </Button>
              </motion.form>
            )}

            {/* Step: Setup (first-time password creation) */}
            {step === "setup" && (
              <motion.form key="setup" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} minLength={6} className="pl-10" autoFocus />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} minLength={6} className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting password...</> : "Set Password & Sign In"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
