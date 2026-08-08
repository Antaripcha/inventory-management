// Shared constants used across the monorepo (client + server)

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

export const PRODUCT_STATUS = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};

export const LOW_STOCK_THRESHOLD = 10;

export const TRANSACTION_TYPES = {
  STOCK_IN: "STOCK_IN",
  STOCK_OUT: "STOCK_OUT",
  ADJUSTMENT: "ADJUSTMENT",
};

export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  STOCK_CHANGE: "STOCK_CHANGE",
};

export function computeStatus(quantity, threshold = LOW_STOCK_THRESHOLD) {
  if (quantity <= 0) return PRODUCT_STATUS.OUT_OF_STOCK;
  if (quantity <= threshold) return PRODUCT_STATUS.LOW_STOCK;
  return PRODUCT_STATUS.IN_STOCK;
}
