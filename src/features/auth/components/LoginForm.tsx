import { FormEvent, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";

export function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("admin@nexo.com");
  const [password, setPassword] = useState("admin123");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!emailValid || !password.trim()) {
      setError("Enter a valid email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      if (!rememberMe) {
        sessionStorage.setItem("nexo-remember-me", "false");
      } else {
        sessionStorage.removeItem("nexo-remember-me");
      }
      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input
          type="email"
          placeholder="admin@nexo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="absolute right-2 top-2 rounded-md p-1 text-black/60 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
            onClick={() => setShowPassword((state) => !state)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-black/20"
          />
          Remember me
        </label>
        <button type="button" className="text-nexo-accent hover:underline">
          Forgot Password?
        </button>
      </div>

      {error ? <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</p> : null}

      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? <><Loader2 size={16} className="mr-2 animate-spin" /> Signing in...</> : "Login"}
      </Button>
    </form>
  );
}
