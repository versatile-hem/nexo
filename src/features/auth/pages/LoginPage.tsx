import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuthStore } from "@/store/authStore";

export function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[#f4f6ef] md:grid-cols-2 dark:bg-[#162118]">
      <section className="relative hidden overflow-hidden p-10 text-[#142013] md:flex md:flex-col md:justify-between dark:text-[#e8f2e4]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,#cde4c7_0%,transparent_45%),radial-gradient(circle_at_100%_100%,#b8d9c8_0%,transparent_42%)] dark:bg-[radial-gradient(circle_at_20%_0%,#2c3d2a_0%,transparent_45%),radial-gradient(circle_at_100%_100%,#264033_0%,transparent_42%)]" />
        <div className="relative">
          <p className="text-sm uppercase tracking-[0.2em] opacity-70">Nexo Platform</p>
          <h1 className="mt-4 text-5xl font-black">Nexo</h1>
          <p className="mt-4 max-w-md text-lg opacity-80">Billing, Inventory, Insights. One system.</p>
        </div>

        <p className="relative max-w-sm text-sm opacity-75">
          Centralize operations, automate repetitive tasks, and ship faster decisions with a clean operations command center.
        </p>
      </section>

      <section className="flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md bg-white/85 p-8 dark:bg-[#203022]/90">
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="mt-2 text-sm opacity-70">Sign in to continue to your workspace.</p>
          <div className="mt-6">
            <LoginForm />
          </div>
          <p className="mt-4 text-xs opacity-60">Use admin@nexo.com / admin123 for demo access.</p>
        </Card>
      </section>
    </main>
  );
}
