import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productsApi } from "@/lib/resources/products";

export function useProducts(params) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.list(params),
    keepPreviousData: true,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product created");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create product"),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => productsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product updated");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update product"),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Product deleted");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete product"),
  });
}

export function useExportProducts() {
  return useMutation({
    mutationFn: productsApi.exportCsv,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `products-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export downloaded");
    },
    onError: () => toast.error("Failed to export products"),
  });
}

export function useImportProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.importCsv,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Imported: ${res.data.created} created, ${res.data.updated} updated`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Import failed"),
  });
}
