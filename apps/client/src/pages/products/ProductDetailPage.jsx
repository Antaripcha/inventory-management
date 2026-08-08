import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import JsBarcode from "jsbarcode";
import { ArrowLeft, Package, Pencil, PackagePlus, Download } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { useProductHistory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { StockAdjustDialog } from "@/components/products/StockAdjustDialog";
import { formatCurrency, formatDate } from "@/lib/utils";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace("/api", "");

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useProduct(id);
  const { data: historyRes } = useProductHistory(id, { limit: 20 });
  const [editOpen, setEditOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const barcodeRef = useRef(null);

  const product = data?.data;
  const history = historyRes?.data || [];

  useEffect(() => {
    if (product?.barcode && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, product.barcode, {
          format: "CODE128",
          height: 50,
          width: 1.6,
          fontSize: 12,
          margin: 8,
        });
      } catch {
        // invalid barcode value for the chosen format; ignore rendering
      }
    }
  }, [product?.barcode]);

  const downloadBarcode = () => {
    if (!barcodeRef.current) return;
    const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${product.sku}-barcode.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!product) {
    return <EmptyState icon={Package} title="Product not found" description="It may have been deleted." />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" /> Back to products
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAdjustOpen(true)}>
            <PackagePlus className="h-4 w-4" /> Adjust stock
          </Button>
          <Button size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-5 p-5 sm:flex-row">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
              {product.image ? (
                <img src={`${API_ORIGIN}${product.image}`} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Package className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{product.name}</h2>
                <StatusBadge status={product.status} />
              </div>
              <p className="font-data text-sm text-muted-foreground">SKU: {product.sku}</p>
              <p className="text-sm text-muted-foreground">{product.description || "No description provided."}</p>
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                <Metric label="Quantity" value={product.quantity} />
                <Metric label="Price" value={formatCurrency(product.price)} />
                <Metric label="Category" value={product.category?.name || "—"} />
                <Metric label="Supplier" value={product.supplier || "—"} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barcode</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            {product.barcode ? (
              <>
                <svg ref={barcodeRef} className="max-w-full" />
                <Button variant="outline" size="sm" onClick={downloadBarcode}>
                  <Download className="h-4 w-4" /> Download SVG
                </Button>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No barcode assigned. Add one from the edit form.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <EmptyState title="No transactions yet" description="Stock changes for this product will appear here." className="py-10" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Previous → New</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((tx) => (
                  <TableRow key={tx._id}>
                    <TableCell className="font-medium">{tx.type.replace("_", " ")}</TableCell>
                    <TableCell className="font-data">{tx.quantity}</TableCell>
                    <TableCell className="font-data text-sm text-muted-foreground">
                      {tx.previousQuantity} → {tx.newQuantity}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tx.reason || "—"}</TableCell>
                    <TableCell className="text-sm">{tx.performedBy?.name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProductFormDialog open={editOpen} onOpenChange={setEditOpen} product={product} />
      <StockAdjustDialog open={adjustOpen} onOpenChange={setAdjustOpen} product={product} />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-data text-sm font-semibold">{value}</p>
    </div>
  );
}
