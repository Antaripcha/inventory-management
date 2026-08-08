import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  PackagePlus,
  Download,
  Upload,
  Package,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useProducts, useExportProducts, useImportProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { StockAdjustDialog } from "@/components/products/StockAdjustDialog";
import { formatCurrency } from "@/lib/utils";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace("/api", "");

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);

  const fileInputRef = useRef(null);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      category: category !== "all" ? category : undefined,
      status: status !== "all" ? status : undefined,
      sortBy,
      sortOrder,
    }),
    [page, debouncedSearch, category, status, sortBy, sortOrder]
  );

  const { data, isLoading, isFetching } = useProducts(params);
  const { data: categoriesRes } = useCategories();
  const categories = categoriesRes?.data || [];

  const exportProducts = useExportProducts();
  const importProducts = useImportProducts();

  const products = data?.data || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (file) importProducts.mutate(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-sm text-muted-foreground">
            {meta.total} product{meta.total === 1 ? "" : "s"} in your catalog
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
          <Button variant="outline" size="sm" onClick={handleImportClick} disabled={importProducts.isPending}>
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportProducts.mutate()} disabled={exportProducts.isPending}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add product
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="In Stock">In Stock</SelectItem>
            <SelectItem value="Low Stock">Low Stock</SelectItem>
            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search or filters, or add your first product to get started."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add product
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14"></TableHead>
                <SortableHead label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <SortableHead label="Quantity" field="quantity" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                <SortableHead label="Price" field="price" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id} className={isFetching ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                      {product.image ? (
                        <img src={`${API_ORIGIN}${product.image}`} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link to={`/products/${product._id}`} className="font-medium hover:text-primary hover:underline">
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-data text-xs">{product.sku}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.category?.name || "—"}</TableCell>
                  <TableCell className="font-data">{product.quantity}</TableCell>
                  <TableCell className="font-data">{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <StatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Adjust stock" onClick={() => setAdjustingProduct(product)}>
                        <PackagePlus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingProduct(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingProduct} />
      <DeleteProductDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        product={deletingProduct}
      />
      <StockAdjustDialog
        open={!!adjustingProduct}
        onOpenChange={(open) => !open && setAdjustingProduct(null)}
        product={adjustingProduct}
      />
    </div>
  );
}

function SortableHead({ label, field, sortBy, sortOrder, onSort }) {
  const active = sortBy === field;
  return (
    <TableHead>
      <button
        className={`flex items-center gap-1 hover:text-foreground ${active ? "text-foreground" : ""}`}
        onClick={() => onSort(field)}
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active && sortOrder === "desc" ? "rotate-180" : ""} transition-transform`} />
      </button>
    </TableHead>
  );
}
