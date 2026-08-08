import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inventoryApi } from "@/lib/resources/inventory";

export function useProductHistory(productId, params) {
  return useQuery({
    queryKey: ["inventory-history", productId, params],
    queryFn: () => inventoryApi.history(productId, params),
    enabled: !!productId,
  });
}

export function useTransactions(params) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => inventoryApi.transactions(params),
    keepPreviousData: true,
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }) => inventoryApi.adjust(productId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["inventory-history"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Stock updated");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update stock"),
  });
}
