import {
  Boxes,
  Layers,
  IndianRupee,
  AlertTriangle,
  PackageX,
  Tags,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  InventoryTrendChart,
  StockStatusChart,
  CategoryDistributionChart,
} from "@/components/dashboard/Charts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const summary = data?.data?.summary;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Products", value: summary?.totalProducts ?? 0, icon: Boxes, tone: "default" },
    { label: "Categories", value: summary?.totalCategories ?? 0, icon: Tags, tone: "default" },
    { label: "Total Stock", value: summary?.totalStock ?? 0, icon: Layers, tone: "default" },
    { label: "Inventory Value", value: formatCurrency(summary?.inventoryValue), icon: IndianRupee, tone: "success" },
    { label: "Low Stock", value: summary?.lowStock ?? 0, icon: AlertTriangle, tone: "warning" },
    { label: "Out of Stock", value: summary?.outOfStock ?? 0, icon: PackageX, tone: "destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {cards.map((c, i) => (
          <StatCard key={c.label} {...c} delay={i * 0.04} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InventoryTrendChart data={data?.data?.trend || []} />
        <StockStatusChart data={data?.data?.stockStatus || []} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CategoryDistributionChart data={data?.data?.categoryDistribution || []} />
      </div>

      <RecentActivity items={data?.data?.recentActivity || []} />
    </div>
  );
}
