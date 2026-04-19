import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/layouts/Sidebar";
import { Topbar } from "@/layouts/Topbar";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";

export function DashboardLayout() {
  const collapsed = useUIStore((state) => state.isSidebarCollapsed);
  const toggle = useUIStore((state) => state.toggleSidebar);

  return (
    <div className="flex min-h-screen">
      <div className="print:hidden">
        <Sidebar collapsed={collapsed} />
      </div>
      <main className="w-full p-4 md:p-6">
        <div className="mb-3 print:hidden">
          <Button variant="ghost" onClick={toggle} className="mb-2">
            <Menu size={16} />
          </Button>
          <Topbar />
        </div>
        <section className="fade-in">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
