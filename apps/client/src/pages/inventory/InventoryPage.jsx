import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react";
import { useTransactions } from "@/hooks/useInventory";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

const TYPE_META = {
  STOCK_IN: { icon: ArrowUpCircle, tone: "success", label: "Stock In" },
  STOCK_OUT: { icon: ArrowDownCircle, tone: "destructive", label: "Stock Out" },
  ADJUSTMENT: { icon: RefreshCw, tone: "warning", label: "Adjustment" },
};

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTransactions({ page, limit: 15 });
  const items = data?.data || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Inventory transactions</h2>
        <p className="text-sm text-muted-foreground">
          {meta.total} transaction{meta.total === 1 ? "" : "s"} across your catalog. Stock is adjusted from
          each product's detail page.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={ArrowLeftRight}
              title="No transactions yet"
              description="Stock movements will appear here once you start adjusting inventory."
              className="py-14"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Previous → New</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((tx) => {
                  const meta = TYPE_META[tx.type] || TYPE_META.ADJUSTMENT;
                  const Icon = meta.icon;
                  return (
                    <TableRow key={tx._id}>
                      <TableCell>
                        <Badge variant={meta.tone}>
                          <Icon className="mr-1 h-3 w-3" /> {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.product ? (
                          <Link to={`/products/${tx.product._id}`} className="font-medium hover:text-primary hover:underline">
                            {tx.product.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Product removed</span>
                        )}
                      </TableCell>
                      <TableCell className="font-data">{tx.quantity}</TableCell>
                      <TableCell className="font-data text-sm text-muted-foreground">
                        {tx.previousQuantity} → {tx.newQuantity}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tx.reason || "—"}</TableCell>
                      <TableCell className="text-sm">{tx.performedBy?.name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
