import {
  Activity,
  Box,
  Boxes,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileBarChart2,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart,
  Users,
  Warehouse,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/authStore";
import { isAdmin, isOperationManager } from "@/utils/roleUtils";

const topNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Boxes },
];

const bottomNav = [
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/reports", label: "Reports", icon: FileBarChart2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

const inventoryChildren = [
  { to: "/inventory/stock-movements", label: "Stock Movements", icon: Activity },
  { to: "/inventory/daily-operations", label: "Daily Operations", icon: ClipboardList },
];

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const inventoryActive = location.pathname.startsWith("/inventory");
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const adminView = isAdmin(role);
  const opsView = isOperationManager(role);

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className={cn("h-screen border-r border-black/10 bg-white/75 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-[#1b281d]", collapsed ? "w-20" : "w-64")}>
      <div className="mb-6 flex items-center gap-2 rounded-xl bg-nexo-accent/10 p-2 text-nexo-accent dark:bg-nexo-accent/20">
        <Box size={20} />
        {!collapsed ? <div><p className="text-xs uppercase tracking-wide">Nexo</p><p className="text-sm font-bold">Ops Console</p></div> : null}
      </div>
      <nav className="space-y-1">
        {opsView ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  isActive ? "bg-nexo-accent text-white" : "hover:bg-black/5 dark:hover:bg-white/10",
                )
              }
            >
              <LayoutDashboard size={16} />
              {!collapsed ? <span>Dashboard</span> : null}
            </NavLink>

            <NavLink
              to="/inventory/stock-in"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  isActive ? "bg-nexo-accent text-white" : "hover:bg-black/5 dark:hover:bg-white/10",
                )
              }
            >
              <Inbox size={16} />
              {!collapsed ? <span>Stock In</span> : null}
            </NavLink>

            <NavLink
              to="/inventory/daily-operations"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  isActive ? "bg-nexo-accent text-white" : "hover:bg-black/5 dark:hover:bg-white/10",
                )
              }
            >
              <ClipboardList size={16} />
              {!collapsed ? <span>Daily Operations</span> : null}
            </NavLink>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/10"
            >
              <LogOut size={16} />
              {!collapsed ? <span>Logout</span> : null}
            </button>
          </>
        ) : null}

        {adminView ? (
          <>
            {topNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                      isActive ? "bg-nexo-accent text-white" : "hover:bg-black/5 dark:hover:bg-white/10",
                    )
                  }
                >
                  <Icon size={16} />
                  {!collapsed ? <span>{item.label}</span> : null}
                </NavLink>
              );
            })}

            <div>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  inventoryActive ? "bg-nexo-accent text-white" : "hover:bg-black/5 dark:hover:bg-white/10",
                )}
                onClick={() => setInventoryOpen((value) => !value)}
              >
                <Warehouse size={16} />
                {!collapsed ? (
                  <>
                    <span className="flex-1 text-left">Inventory</span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform duration-200",
                        (inventoryOpen || inventoryActive) ? "rotate-180" : "rotate-0",
                      )}
                    />
                  </>
                ) : null}
              </button>

              {!collapsed ? (
                <div
                  className={cn(
                    "ml-8 overflow-hidden border-l border-black/10 pl-3 transition-all duration-200 dark:border-white/20",
                    (inventoryOpen || inventoryActive) ? "mt-2 max-h-48 space-y-1 opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  {inventoryChildren.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2 rounded-md px-2 py-1 text-xs",
                            isActive ? "bg-nexo-accent text-white" : "opacity-80 hover:bg-black/5 dark:hover:bg-white/10",
                          )
                        }
                      >
                        <ChildIcon size={13} />
                        <span>{child.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {bottomNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                      isActive ? "bg-nexo-accent text-white" : "hover:bg-black/5 dark:hover:bg-white/10",
                    )
                  }
                >
                  <Icon size={16} />
                  {!collapsed ? <span>{item.label}</span> : null}
                </NavLink>
              );
            })}
          </>
        ) : null}
      </nav>
    </aside>
  );
}
