import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

const TITLES = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/categories": "Categories",
  "/inventory": "Inventory",
  "/audit-logs": "Audit Logs",
};

function resolveTitle(pathname) {
  const match = Object.keys(TITLES).find((key) => pathname.startsWith(key));
  return TITLES[match] || "Inventory Management";
}

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={resolveTitle(location.pathname)} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
