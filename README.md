# Inventory Management System

A production-ready, full-stack Inventory Management System built as a **TurboRepo monorepo**. Track products, categories, stock levels and inventory value in real time, with role-based access control, a full audit trail, CSV import/export, barcode generation, and interactive dashboards.

![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/mongodb-7-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Monorepo structure](#monorepo-structure)
3. [Features](#features)
4. [Quick start](#quick-start)
5. [Running with Docker](#running-with-docker)
6. [Environment variables](#environment-variables)
7. [Seeding the database](#seeding-the-database)
8. [API documentation](#api-documentation)
9. [Postman collection](#postman-collection)
10. [Testing](#testing)
11. [Database schema (ER diagram)](#database-schema)
12. [Project scripts](#project-scripts)
13. [Security notes](#security-notes)

---

## Tech stack

| Layer | Technology |
|---|---|
| Monorepo | TurboRepo + npm workspaces |
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui-style components (Radix primitives), React Router, Axios, React Hook Form + Zod, Zustand, TanStack Query, Recharts, Framer Motion, Sonner |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, express-validator, Multer, Helmet, CORS, Morgan, Compression |
| Docs | Swagger / OpenAPI 3 (swagger-jsdoc + swagger-ui-express) |
| Testing | Jest, Supertest, mongodb-memory-server |
| Deployment | Docker, Docker Compose, Nginx (static client) |

## Monorepo structure

```
inventory-management/
├── apps/
│   ├── client/            # React + Vite frontend
│   └── server/             # Express + MongoDB backend
├── packages/
│   ├── ui/                 # Small set of framework-level shared components (Logo, brand constants)
│   ├── config/              # Shared Tailwind tokens + ESLint preset
│   └── types/               # Shared Zod schemas & constants used by both client and server
├── docs/                    # ER diagram
├── postman/                 # Postman collection + environment
├── docker-compose.yml
└── turbo.json
```

The **shadcn/ui-style components** (Button, Input, Dialog, Table, Select, etc.) live in `apps/client/src/components/ui`, following the standard shadcn convention of copying components directly into the consuming app rather than importing them from a compiled package.

## Features

### Authentication
- Register / Login / Logout
- JWT access tokens (short-lived) + rotating refresh tokens (httpOnly cookie + response body)
- Protected routes on both the API (middleware) and the client (route guards)
- Passwords hashed with bcrypt
- Role-based access control (`admin` / `user`) — the **first registered user automatically becomes admin**

### Dashboard
- Total products, categories, stock units, inventory value, low-stock and out-of-stock counts
- Stock movement area chart (last 14 days), stock-status pie chart, products-by-category bar chart (Recharts)
- Recent activity feed

### Products
Full CRUD with name, unique SKU, category, description, quantity, price, supplier, image upload, barcode, auto-computed status (`In Stock` / `Low Stock` / `Out of Stock`), created/updated timestamps and audit metadata. Includes barcode rendering (CODE128, via JsBarcode) and SVG download on the product detail page.

### Categories
CRUD with live product counts per category and duplicate-name prevention (case-insensitive).

### Inventory
- Increase stock (Stock In), reduce stock (Stock Out), or set an exact quantity (Adjustment)
- Negative quantities are rejected at the service layer
- Full transaction history per product and system-wide

### Product table
Search by name/SKU, filter by category and status, sortable columns, server-side pagination, responsive layout.

### Validation
Zod schemas shared between client and server (`packages/types`) plus `express-validator` chains on the API, so every rule (required fields, unique SKU, positive quantity/price, email format, password length, etc.) is enforced in both places with consistent error messages.

### Bonus features included
- CSV export of all products, CSV bulk import (creates or updates by SKU, auto-creates missing categories)
- Product image upload (Multer, validated file types/size)
- Barcode generation & download (CODE128)
- Role-based access control (`admin` vs `user`) enforced on every mutating route
- Audit log of create/update/delete/login/logout/stock-change events, viewable by admins
- Swagger/OpenAPI documentation at `/api-docs`
- Docker & Docker Compose for one-command startup
- Jest + Supertest integration tests (auth, products, inventory) using an in-memory MongoDB

### UI
Responsive layout, dark mode (light/dark/system, persisted), collapsible sidebar, top navbar with user menu, loading skeletons, toast notifications (Sonner), empty states, confirmation dialogs for destructive actions, and a small reusable component library.

## Quick start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 10
- A running MongoDB instance (local, Atlas, or via Docker — see below)

### 1. Install dependencies

```bash
git clone <this-repo>
cd inventory-management
npm install
```

### 2. Configure environment variables

```bash
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env
```

Edit `apps/server/.env` and set `MONGO_URI` to your MongoDB connection string, and generate real values for `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (e.g. `openssl rand -hex 32`).

### 3. Seed the database (optional but recommended)

```bash
npm run seed
```

This creates an admin (`admin@inventory.com` / `Admin@12345`), a staff user (`staff@inventory.com` / `Staff@12345`), five categories, ~25 products with varied stock levels, and sample inventory transactions.

### 4. Start the dev servers

```bash
npm run dev
```

This runs both apps in parallel via Turborepo:
- API: http://localhost:5000 (Swagger docs at `/api-docs`)
- Client: http://localhost:5173

## Running with Docker

```bash
cp .env.example .env   # set real JWT secrets before production use
docker compose up --build
```

This starts three containers:
- `mongo` — MongoDB 7 with a persisted volume
- `server` — the Express API on port `5000`
- `client` — the built React app served by Nginx on port `5173`, which proxies `/api` and `/uploads` to the `server` container

Seed the containerized database once it's up:

```bash
docker compose exec server node src/seeders/seed.js
```

Then open http://localhost:5173.

## Environment variables

### `apps/server/.env`

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | `development` \| `production` \| `test` | `development` |
| `PORT` | API port | `5000` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/inventory_management` |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens | — |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | — |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `UPLOAD_DIR` | Directory for uploaded images | `uploads` |
| `MAX_FILE_SIZE_MB` | Max product image size | `5` |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | General API rate limiting | `900000` / `300` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Seed script admin credentials | see `.env.example` |

### `apps/client/.env`

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL the client calls | `http://localhost:5000/api` |

## Seeding the database

```bash
npm run seed
```

Runs `apps/server/src/seeders/seed.js`, which **wipes and repopulates** the `users`, `categories`, `products`, `inventoryTransactions`, `auditLogs` and `refreshTokens` collections. Do not run this against a production database with real data.

## API documentation

Interactive Swagger UI is served at:

```
http://localhost:5000/api-docs
```

The raw OpenAPI JSON is available at `http://localhost:5000/api-docs.json`.

All endpoints (except `/auth/register`, `/auth/login`, `/auth/refresh`) require a Bearer access token:

```
Authorization: Bearer <accessToken>
```

### Endpoint summary

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/refresh` | Rotate refresh token, get new access token | Public (valid refresh token) |
| POST | `/api/auth/logout` | Revoke refresh token | Any |
| GET | `/api/auth/me` | Current user | Any |
| GET/POST | `/api/categories` | List / create categories | Any / Admin |
| GET/PUT/DELETE | `/api/categories/:id` | Get / update / delete a category | Any / Admin / Admin |
| GET/POST | `/api/products` | List (search/filter/sort/paginate) / create | Any / Any |
| GET/PUT/DELETE | `/api/products/:id` | Get / update / delete | Any / Any / Admin |
| GET | `/api/products/export/csv` | Export all products as CSV | Any |
| POST | `/api/products/import/csv` | Bulk import products from CSV | Admin |
| POST | `/api/inventory/:id/adjust` | Increase, reduce or set stock | Any |
| GET | `/api/inventory/:id/history` | Transaction history for a product | Any |
| GET | `/api/inventory/transactions` | All transactions | Any |
| GET | `/api/dashboard` | Summary metrics, chart data, recent activity | Any |
| GET | `/api/audit-logs` | Full audit trail | Admin |
| GET | `/api/health` | Health check | Public |

## Postman collection

Import both files from `postman/`:
- `Inventory-Management.postman_collection.json`
- `Inventory-Management-Local.postman_environment.json`

The collection auto-captures `accessToken`, `refreshToken`, `categoryId` and `productId` into environment variables via test scripts on the Register/Login/Create requests, so subsequent requests work out of the box.

## Testing

```bash
cd apps/server
npm test
```

Runs Jest + Supertest integration tests against an in-memory MongoDB instance (`mongodb-memory-server`), covering registration/login validation, duplicate SKU/category prevention, negative-quantity prevention, and stock-adjustment transaction recording.

> **Note:** `mongodb-memory-server` downloads a MongoDB binary on first run. If your environment has restricted network access, point `MONGO_URI` at a running MongoDB instance and adapt `tests/setup.js` accordingly, or run the tests inside the provided Docker network.

## Database schema

See [`docs/ER-DIAGRAM.md`](./docs/ER-DIAGRAM.md) for the full Mermaid entity-relationship diagram covering `User`, `RefreshToken`, `Category`, `Product`, `InventoryTransaction` and `AuditLog`.

## Project scripts

Run from the repo root (powered by Turborepo):

| Command | Description |
|---|---|
| `npm run dev` | Run client + server in dev mode |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all apps/packages |
| `npm run seed` | Seed the database (server workspace) |
| `npm test` | Run server test suite |

## Security notes

- Passwords are hashed with bcrypt (10 salt rounds) and never returned by the API.
- Access tokens are short-lived; refresh tokens are stored server-side (`RefreshToken` collection) and rotated on every use, so a stolen refresh token can be invalidated by revoking its document.
- `helmet`, `express-mongo-sanitize`, and per-route rate limiting are enabled by default.
- All mutating routes validate input with `express-validator` server-side, in addition to Zod validation on the client — never trust client-side validation alone.
- Uploaded files are restricted by MIME type and size and stored outside of version control (`uploads/`).
- Set real, unique values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` before deploying — the defaults are for local development only.

---

Built with a clean, layered architecture (routes → validators → controllers → services → models) so each concern is easy to test and extend in isolation.
