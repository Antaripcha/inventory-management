import { api } from "@/lib/api";

export const inventoryApi = {
  adjust: (productId, payload) => api.post(`/inventory/${productId}/adjust`, payload).then((r) => r.data),
  history: (productId, params) =>
    api.get(`/inventory/${productId}/history`, { params }).then((r) => r.data),
  transactions: (params) => api.get("/inventory/transactions", { params }).then((r) => r.data),
};
