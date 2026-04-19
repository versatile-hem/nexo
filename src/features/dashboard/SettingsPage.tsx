import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

export function SettingsPage() {
  const role = useAuthStore((state) => state.role);

  return (
    <Card>
      <h2 className="text-lg font-semibold">Settings</h2>
      <p className="mt-2 text-sm opacity-70">Admin settings module is available only for admin users.</p>
      <div className="mt-4">
        <span className="text-sm">Current role: {role ?? "none"}</span>
      </div>
    </Card>
  );
}
