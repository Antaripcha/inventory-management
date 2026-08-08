import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

const TYPE_META = {
  STOCK_IN: { icon: ArrowUpCircle, tone: "text-[hsl(var(--success))]", label: "Stock in" },
  STOCK_OUT: { icon: ArrowDownCircle, tone: "text-destructive", label: "Stock out" },
  ADJUSTMENT: { icon: RefreshCw, tone: "text-[hsl(var(--warning))]", label: "Adjustment" },
};

export function RecentActivity({ items = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title="No activity yet" description="Stock changes will show up here." />
        ) : (
          <ul className="space-y-4">
            {items.map((tx) => {
              const meta = TYPE_META[tx.type] || TYPE_META.ADJUSTMENT;
              const Icon = meta.icon;
              return (
                <li key={tx._id} className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.tone}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {meta.label} · {tx.product?.name || "Product removed"}
                      <span className="ml-1 font-data text-xs text-muted-foreground">
                        ({tx.product?.sku})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.quantity} units by {tx.performedBy?.name || "Unknown"} · {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
