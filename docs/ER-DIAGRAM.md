# Entity Relationship Diagram

```mermaid
erDiagram
  USER ||--o{ REFRESH_TOKEN : owns
  USER ||--o{ PRODUCT : creates
  USER ||--o{ CATEGORY : creates
  USER ||--o{ INVENTORY_TRANSACTION : performs
  USER ||--o{ AUDIT_LOG : generates
  CATEGORY ||--o{ PRODUCT : classifies
  PRODUCT ||--o{ INVENTORY_TRANSACTION : has

  USER {
    ObjectId _id PK
    string name
    string email UK
    string password
    string role "admin | user"
    string avatar
    boolean isActive
    date lastLoginAt
    date createdAt
    date updatedAt
  }

  REFRESH_TOKEN {
    ObjectId _id PK
    ObjectId user FK
    string token UK
    string userAgent
    string ip
    date expiresAt
    boolean revoked
    string replacedByToken
    date createdAt
  }

  CATEGORY {
    ObjectId _id PK
    string name UK
    string slug UK
    string description
    ObjectId createdBy FK
    date createdAt
    date updatedAt
  }

  PRODUCT {
    ObjectId _id PK
    string name
    string sku UK
    ObjectId category FK
    string description
    number quantity
    number price
    string supplier
    string image
    string barcode
    number lowStockThreshold
    string status "In Stock | Low Stock | Out of Stock"
    ObjectId createdBy FK
    ObjectId updatedBy FK
    date createdAt
    date updatedAt
  }

  INVENTORY_TRANSACTION {
    ObjectId _id PK
    ObjectId product FK
    string type "STOCK_IN | STOCK_OUT | ADJUSTMENT"
    number quantity
    number previousQuantity
    number newQuantity
    string reason
    ObjectId performedBy FK
    date createdAt
  }

  AUDIT_LOG {
    ObjectId _id PK
    ObjectId user FK
    string action "CREATE | UPDATE | DELETE | LOGIN | LOGOUT | STOCK_CHANGE"
    string entity
    ObjectId entityId
    string description
    object metadata
    string ip
    date createdAt
  }
```

## Notes

- **User → RefreshToken**: one-to-many. Each login/refresh issues a new rotating refresh token document; tokens are revoked on logout or rotation and auto-expire via a MongoDB TTL index on `expiresAt`.
- **Category → Product**: one-to-many. A category cannot be deleted while any product still references it.
- **Product → InventoryTransaction**: one-to-many, append-only ledger. `quantity` on `Product` is a derived, denormalized value kept in sync by `applyStockChange` (see `apps/server/src/services/inventory.service.js`); the transaction log is the source of truth for history.
- **AuditLog** references `User` and stores a free-form `entity`/`entityId` pointer so it can describe actions taken against Users, Categories, Products, or stock changes without needing a relation to every collection.
