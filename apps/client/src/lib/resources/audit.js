import { api } from "@/lib/api";

export const auditApi = {
  list: (params) => api.get("/audit-logs", { params }).then((r) => r.data),
};
