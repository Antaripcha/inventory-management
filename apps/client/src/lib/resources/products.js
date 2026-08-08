import { api } from "@/lib/api";

function toFormData(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "image" && value instanceof File) {
      formData.append("image", value);
    } else if (key !== "image") {
      formData.append(key, value);
    }
  });
  return formData;
}

export const productsApi = {
  list: (params) => api.get("/products", { params }).then((r) => r.data),
  get: (id) => api.get(`/products/${id}`).then((r) => r.data),
  create: (payload) =>
    api
      .post("/products", toFormData(payload), { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data),
  update: (id, payload) =>
    api
      .put(`/products/${id}`, toFormData(payload), { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
  exportCsv: () => api.get("/products/export/csv", { responseType: "blob" }).then((r) => r.data),
  importCsv: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return api
      .post("/products/import/csv", fd, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
};
