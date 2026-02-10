import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Check, X, Users, Shield } from "lucide-react";
import registerCityscape from "@/assets/register-cityscape.jpg";
import projectLogo from "@/assets/project-logo.png";

const ROLE_CONFIG: Record<string, { label: string; description: string; apiRole: string; icon: typeof Users }> = {
  voter: { label: "Voter", description: "Vote on polls and view results", apiRole: "VOTER", icon: Users },
  "poll-admin": { label: "Poll Admin", description: "Create and manage polls", apiRole: "POLL_ADMIN", icon: Shield },
  // "system-admin": { label: "System Admin", description: "Manage the entire platform", apiRole: "SYSTEM_ADMIN", icon: Settings },
};

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length < 6) return { label: "Weak", color: "bg-destructive", width: "w-1/4" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [pw.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score <= 1) return { label: "Weak", color: "bg-destructive", width: "w-1/4" };
  if (score === 2) return { label: "Medium", color: "bg-warning", width: "w-2/4" };
  return { label: "Strong", color: "bg-success", width: "w-full" };
}

function RegisterRoleSelection() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <img src={registerCityscape} alt="City skyline illustration" className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative z-10 px-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 mb-6">
            <img src={projectLogo} alt="Project Nexus" className="h-5 w-5" />
            <span className="text-white font-medium">Project Nexus</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Join Our Community</h2>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Choose your role and start participating in polls that shape our future.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <img src={projectLogo} alt="Project Nexus" className="h-6 w-6" />
            <span className="text-xl font-bold text-foreground">Project Nexus</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
            <p className="mt-2 text-muted-foreground">Select your role to get started</p>
          </div>

          <div className="space-y-4">
            {Object.entries(ROLE_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <Link key={key} to={`/register/${key}`}>
                  <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md mb-3">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{config.label}</CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const { role: roleParam } = useParams<{ role: string }>();
  const roleConfig = roleParam ? ROLE_CONFIG[roleParam] : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!roleConfig) {
    return <RegisterRoleSelection />;
  }

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Please fill in all required fields", variant: "warning" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "warning" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "warning" });
      return;
    }
    setIsSubmitting(true);
    try {
      await register({ email, password, role: roleConfig.apiRole });
      toast({ title: "Account created!", description: "Welcome aboard! Please sign in with your credentials.", variant: "success" });
      navigate("/login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Please try again";
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const RoleIcon = roleConfig.icon;

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <img src={registerCityscape} alt="City skyline illustration" className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative z-10 px-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 mb-6">
            <img src={projectLogo} alt="Project Nexus" className="h-5 w-5" />
            <span className="text-white font-medium">Project Nexus</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Join as {roleConfig.label}</h2>
          <p className="text-white/80 text-lg max-w-md mx-auto">{roleConfig.description}</p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <img src={projectLogo} alt="Project Nexus" className="h-6 w-6" />
            <span className="text-xl font-bold text-foreground">Project Nexus</span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <RoleIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Register as {roleConfig.label}</h1>
                <p className="text-muted-foreground">{roleConfig.description}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password strength: <span className="font-medium">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {passwordsMatch && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />}
                {passwordsMismatch && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {passwordsMismatch && <p className="text-xs text-destructive">Passwords do not match</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : `Create ${roleConfig.label} Account`}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground underline">
              ← Choose a different role
            </Link>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
