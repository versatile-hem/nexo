import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export function SettingsPage() {
  const role = useAuthStore((state) => state.role);
  const setRole = useAuthStore((state) => state.setRole);

  const nextRole = role === "admin" ? "manager" : "admin";

  return (
    <Card>
      <h2 className="text-lg font-semibold">Settings</h2>
      <p className="mt-2 text-sm opacity-70">Role-based access placeholder for future auth integration.</p>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm">Current role: {role ?? "none"}</span>
        <Button variant="secondary" onClick={() => setRole(nextRole)}>
          Toggle Role
        </Button>
      </div>
    </Card>
  );
}
