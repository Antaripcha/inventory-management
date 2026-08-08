import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ArrowLeftRight,
  ScrollText,
  X,
} from "lucide-react";
import { Logo } from "@inventory/ui";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/inventory", label: "Inventory", icon: ArrowLeftRight },
  { to: "/audit-logs", label: "Audit Logs", icon: ScrollText, adminOnly: true },
];

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const role = useAuthStore((s) => s.user?.role);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-7 text-[hsl(var(--sidebar-active))]" />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">Stockroom</p>
              <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--sidebar-muted))]">
                Inventory OS
              </p>
            </div>
          </div>
          <button
            className="rounded-md p-1.5 text-[hsl(var(--sidebar-muted))] hover:bg-white/5 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin").map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[hsl(var(--sidebar-active))]/15 text-[hsl(var(--sidebar-active))]"
                    : "text-[hsl(var(--sidebar-muted))] hover:bg-white/5 hover:text-[hsl(var(--sidebar-fg))]"
                )
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 px-5 py-4 text-[11px] text-[hsl(var(--sidebar-muted))]">
          Inventory Management System v1.0
        </div>
      </aside>
    </>
  );
}
