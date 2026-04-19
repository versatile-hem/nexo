import { Bell, ChevronDown, Moon, Plus, Search, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/mocks/data";
import { useDebounce } from "@/hooks/useDebounce";

export function Topbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const search = useUIStore((state) => state.globalSearch);
  const setSearch = useUIStore((state) => state.setGlobalSearch);
  const dark = useUIStore((state) => state.darkMode);
  const toggleDark = useUIStore((state) => state.toggleDarkMode);
  const debounced = useDebounce(search, 200);
  const [menuOpen, setMenuOpen] = useState(false);

  const matches = useMemo(() => {
    const term = debounced.toLowerCase().trim();
    if (!term) return [];
    const products = db.products
      .filter((p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term))
      .map((p) => ({ id: p.id, label: p.name, route: "/products" }));
    const orders = db.orders
      .filter((o) => o.id.toLowerCase().includes(term) || o.customer.toLowerCase().includes(term))
      .map((o) => ({ id: o.id, label: `${o.id} • ${o.customer}`, route: "/orders" }));
    return [...products, ...orders].slice(0, 5);
  }, [debounced]);

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="relative mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-black/10 bg-white/75 p-3 shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-[#1f2b20]">
      <div className="relative min-w-[220px] flex-1">
        <Search size={16} className="absolute left-3 top-2.5 opacity-60" />
        <Input className="pl-9" placeholder="Search products, orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {matches.length > 0 ? (
          <div className="absolute z-20 mt-1 w-full rounded-xl border border-black/10 bg-white p-2 shadow-card dark:border-white/20 dark:bg-[#213124]">
            {matches.map((item) => (
              <Link key={item.id} to={item.route} className="block rounded-md px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Link to="/products/new"><Button variant="secondary"><Plus size={16} /> Add Product</Button></Link>
        <Link to="/billing/create-invoice"><Button>Create Invoice</Button></Link>
        <Button variant="ghost" onClick={toggleDark}>{dark ? <Sun size={16} /> : <Moon size={16} />}</Button>
        <Button variant="ghost"><Bell size={16} /></Button>
        <div className="relative">
          <Button variant="secondary" className="gap-2" onClick={() => setMenuOpen((state) => !state)}>
            {user?.name ?? "User"} <ChevronDown size={16} />
          </Button>
          {menuOpen ? (
            <div className="absolute right-0 z-30 mt-1 w-44 rounded-xl border border-black/10 bg-white p-2 shadow-card dark:border-white/20 dark:bg-[#213124]">
              <p className="px-2 py-1 text-xs opacity-70">{user?.email ?? ""}</p>
              <button
                type="button"
                className="mt-1 w-full rounded-md px-2 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
