# 🍽️ Smart Restaurant Management System

A **production-level**, **scalable**, modular backend for restaurant management built with Node.js, Express, MongoDB, and JWT authentication.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Overview](#-api-overview)
- [Database Models](#-database-models)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Running with Docker](#-running-with-docker)
- [API Documentation](#-api-documentation-swagger)
- [Authentication Flow](#-authentication-flow)
- [Deployment](#-deployment-render--railway)
- [Testing](#-testing)
- [Default Credentials](#-default-credentials-after-seeding)

---

## ✨ Features

| Module | Highlights |
|---|---|
| 🔐 **Auth & RBAC** | JWT, bcrypt, role-based middleware (Admin / Staff / Customer) |
| 👥 **Users** | CRUD, soft delete, restore, profile management |
| 🍕 **Menu** | Categories, search, image upload, availability toggle, pagination |
| 📦 **Inventory** | Stock tracking, auto-deduction on orders, low stock alerts, history log |
| 🪑 **Reservations** | Smart table assignment, conflict detection, availability check |
| 📋 **Orders** | Kitchen workflow engine, status transitions, inventory auto-deduct |
| 🧾 **Billing** | JSON bill + downloadable PDF invoice |
| 📊 **Analytics** | Sales, revenue, top items, inventory usage, dashboard KPIs |
| 🔌 **Real-time** | Socket.io for live order updates to kitchen |
| 📧 **Email** | Order confirmation, reservation confirmation, low stock alerts |
| 📖 **Swagger** | Full interactive API documentation at `/api-docs` |

---

## 🛠️ Tech Stack

```
Runtime:      Node.js 20+
Framework:    Express.js
Database:     MongoDB + Mongoose
Auth:         JWT + bcrypt
Validation:   express-validator
Security:     helmet, cors, express-rate-limit
Logging:      winston + morgan
Docs:         swagger-jsdoc + swagger-ui-express
File Upload:  multer
PDF:          pdfkit
Email:        nodemailer
Real-time:    socket.io
Testing:      Jest + Supertest
Docker:       Dockerfile + docker-compose
```

---

## 📁 Project Structure

```
smart-restaurant/
│
├── config/
│   ├── db.js                  # MongoDB connection
│   └── swagger.js             # Swagger/OpenAPI spec config
│
├── controllers/               # Request handlers (thin layer)
│   ├── authController.js
│   ├── userController.js
│   ├── menuController.js
│   ├── inventoryController.js
│   ├── reservationController.js
│   ├── orderController.js     # Includes PDF bill generation
│   └── analyticsController.js
│
├── middleware/
│   ├── auth.js                # JWT protect + authorize(roles)
│   ├── errorMiddleware.js     # Global error handler + 404
│   ├── validate.js            # express-validator runner
│   └── upload.js              # Multer image upload config
│
├── models/
│   ├── User.js                # Soft delete, password hash hooks
│   ├── MenuItem.js            # Ingredients linked to inventory
│   ├── Inventory.js           # Stock history, deductStock(), addStock()
│   ├── Reservation.js         # Table + Reservation schemas
│   ├── Order.js               # Status history, auto order number
│   └── AnalyticsLog.js        # Event tracking
│
├── routes/                    # Express routers with Swagger JSDoc
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── menuRoutes.js
│   ├── inventoryRoutes.js
│   ├── reservationRoutes.js
│   ├── orderRoutes.js
│   └── analyticsRoutes.js
│
├── services/                  # Business logic layer
│   ├── authService.js
│   ├── userService.js
│   ├── menuService.js
│   ├── inventoryService.js    # autoDeductForOrder() engine
│   ├── reservationService.js  # Smart table assignment algorithm
│   ├── orderService.js        # Kitchen workflow + inventory trigger
│   ├── analyticsService.js    # Aggregation pipelines
│   └── emailService.js        # Nodemailer templates
│
├── validators/
│   └── index.js               # All express-validator chains
│
├── utils/
│   ├── logger.js              # Winston logger
│   ├── apiResponse.js         # Standardized response helper
│   ├── errorHandler.js        # AppError class + asyncHandler
│   ├── helpers.js             # JWT, pagination, sort, search utils
│   └── seeder.js              # Database seed/destroy script
│
├── __tests__/
│   └── app.test.js            # Jest unit tests (auth, menu, inventory, utils)
│
├── uploads/menu/              # Uploaded menu images
├── logs/                      # Winston log files
├── docker/
│   └── mongo-init.js          # MongoDB init script
│
├── app.js                     # Express app setup (middleware, routes)
├── server.js                  # HTTP server + Socket.io + graceful shutdown
├── Dockerfile                 # Production Docker image
├── docker-compose.yml         # Full stack (API + MongoDB + Mongo Express)
├── render.yaml                # Render.com deployment config
├── jest.config.js
├── .env.example
└── .gitignore
```

---

## 🌐 API Overview

All routes are prefixed with `/api/v1`

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login, get JWT |
| GET | `/auth/me` | Private | Get own profile |
| PUT | `/auth/change-password` | Private | Change password |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users` | Admin | List all users |
| GET | `/users/stats` | Admin | User statistics |
| GET | `/users/:id` | Admin/Staff | Get user |
| PUT | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Soft delete user |
| POST | `/users/:id/restore` | Admin | Restore deleted user |
| PUT | `/users/me` | Private | Update own profile |

### Menu
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/menu` | Public | List items (search, filter, paginate) |
| GET | `/menu/categories` | Public | Category counts |
| GET | `/menu/:id` | Public | Single item |
| POST | `/menu` | Admin/Staff | Create item (+ image upload) |
| PUT | `/menu/:id` | Admin/Staff | Update item |
| DELETE | `/menu/:id` | Admin | Delete item |
| PATCH | `/menu/:id/toggle-availability` | Admin/Staff | Toggle on/off |

### Inventory
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/inventory` | Admin/Staff | List inventory |
| GET | `/inventory/low-stock` | Admin/Staff | Low stock items |
| GET | `/inventory/:id` | Admin/Staff | Single item |
| GET | `/inventory/:id/history` | Admin/Staff | Stock change history |
| POST | `/inventory` | Admin/Staff | Create item |
| PUT | `/inventory/:id` | Admin/Staff | Update item details |
| PATCH | `/inventory/:id/add-stock` | Admin/Staff | Add stock |
| PATCH | `/inventory/:id/deduct-stock` | Admin/Staff | Manual deduction |

### Reservations & Tables
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/reservations/availability` | Public | Check table availability |
| POST | `/reservations` | Customer+ | Create reservation (auto-assigns table) |
| GET | `/reservations/my` | Customer+ | Own reservations |
| GET | `/reservations` | Admin/Staff | All reservations |
| GET | `/reservations/:id` | Private | Single reservation |
| PATCH | `/reservations/:id/cancel` | Customer+ | Cancel reservation |
| PATCH | `/reservations/:id/status` | Admin/Staff | Update status |
| GET | `/reservations/tables` | Admin/Staff | All tables |
| POST | `/reservations/tables` | Admin | Add table |
| PUT | `/reservations/tables/:id` | Admin | Update table |
| DELETE | `/reservations/tables/:id` | Admin | Deactivate table |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/orders` | Customer+ | Place order (auto-deducts inventory) |
| GET | `/orders/my` | Customer+ | Own order history |
| GET | `/orders/kitchen` | Admin/Staff | Active kitchen queue |
| GET | `/orders` | Admin/Staff | All orders |
| GET | `/orders/:id` | Private | Single order |
| PATCH | `/orders/:id/status` | Admin/Staff | Update status (workflow engine) |
| PATCH | `/orders/:id/payment` | Admin/Staff | Mark payment |
| GET | `/orders/:id/bill` | Private | JSON bill |
| GET | `/orders/:id/bill/pdf` | Private | Download PDF bill |

### Analytics (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/dashboard` | KPI summary |
| GET | `/analytics/sales?period=month` | Sales report |
| GET | `/analytics/revenue?period=month` | Revenue + growth |
| GET | `/analytics/top-items?limit=10` | Most ordered items |
| GET | `/analytics/orders?period=month` | Order breakdown |
| GET | `/analytics/inventory` | Inventory + low stock |

---

## 🗄️ Database Models

### User
```
name, email, password (hashed), role (admin|staff|customer),
phone, address, profileImage, isActive, deletedAt (soft delete),
totalOrders, totalSpent, lastLogin, timestamps
```

### MenuItem
```
name, category, description, price, discountedPrice,
ingredients[{ inventoryItem(ref), quantity, unit }],
isAvailable, imageUrl, preparationTime, calories,
isVegetarian, isVegan, spiceLevel, tags, ratings, totalOrdered
```

### Inventory
```
name, category, quantity, unit, minimumThreshold, costPerUnit,
supplier{ name, contact, email, address },
history[{ action, quantity, previousQuantity, newQuantity, reason, orderId, performedBy, timestamp }],
isActive, lastRestocked
```

### Table
```
tableNumber, seatingCapacity, location (indoor|outdoor|private|bar|patio),
isAvailable, features[], isActive
```

### Reservation
```
customer(ref User), table(ref Table), date, time, guestCount,
status (pending|confirmed|seated|completed|cancelled|no_show),
specialRequests, occasion, estimatedDuration,
confirmedAt, cancelledAt, cancellationReason, assignedBy
```

### Order
```
orderNumber (auto-generated), customer(ref), table(ref), reservation(ref),
items[{ menuItem(ref), name, quantity, unitPrice, subtotal, specialInstructions }],
orderType (dine_in|takeaway|delivery),
orderStatus (pending|confirmed|preparing|ready|delivered|cancelled),
statusHistory[], subtotal, taxRate, taxAmount, discountAmount, totalAmount,
paymentStatus, paymentMethod, paidAt,
assignedStaff, notes, inventoryDeducted
```

### AnalyticsLog
```
eventType, referenceId, referenceModel, data (mixed), revenue, date
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone and install
```bash
git clone <repo-url>
cd smart-restaurant
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed the database
```bash
npm run seed
```

### 4. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 5. Open API docs
```
http://localhost:5000/api-docs
```

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/smart_restaurant` |
| `JWT_SECRET` | JWT signing secret | *(required)* |
| `JWT_EXPIRE` | Token expiry | `7d` |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_EMAIL` | Sender email | *(optional)* |
| `SMTP_PASSWORD` | Email app password | *(optional)* |
| `RATE_LIMIT_MAX` | Requests per window | `100` |
| `CLIENT_URL` | CORS allowed origin | `http://localhost:3000` |

---

## 🐳 Running with Docker

### Start everything (API + MongoDB)
```bash
docker-compose up -d
```

### Start with Mongo Express UI
```bash
docker-compose --profile dev up -d
# Mongo Express: http://localhost:8081 (admin/admin123)
```

### Stop
```bash
docker-compose down
```

---

## 📖 API Documentation (Swagger)

Interactive Swagger UI is available at:
```
http://localhost:5000/api-docs
```

**How to authenticate in Swagger:**
1. Call `POST /auth/login` with your credentials
2. Copy the `token` from the response
3. Click **Authorize** (top right)
4. Enter: `Bearer <your_token>`
5. All protected routes now work

---

## 🔐 Authentication Flow

```
Client                          Server
  │                               │
  │── POST /auth/register ────────▶ Hash password (bcrypt)
  │                               │ Create User
  │◀─── { token, user } ─────────│
  │                               │
  │── POST /auth/login ───────────▶ Find user by email
  │                               │ Compare password (bcrypt)
  │                               │ Sign JWT { id, role }
  │◀─── { token, user } ─────────│
  │                               │
  │── GET /api/v1/orders ─────────▶ protect middleware
  │   Authorization: Bearer <tk>  │ Verify JWT
  │                               │ Attach req.user
  │                               │ authorize('admin','staff')
  │                               │ Check role
  │◀─── 200 OK / 401 / 403 ──────│
```

---

## 🧩 Key Business Logic

### 📦 Inventory Auto-Deduction
When an order is placed, the system:
1. Fetches each ordered menu item with its ingredient list
2. Multiplies ingredient quantity × order quantity
3. Calls `inventory.deductStock()` for each ingredient
4. Logs the deduction in inventory history with order reference
5. Triggers low stock analytics event if threshold crossed

### 🪑 Smart Table Assignment
When a reservation is created:
1. Filter tables with `seatingCapacity >= guestCount`
2. Sort by seating capacity ascending (prefer smallest fit)
3. For each candidate table, check for reservation conflicts within a 2-hour window
4. Return the first conflict-free table

### 📋 Order Status Workflow Engine
Valid transitions enforced:
```
pending → confirmed → preparing → ready → delivered
   ↓          ↓           ↓
cancelled  cancelled   cancelled
```

---

## ☁️ Deployment (Render / Railway)

### Render
1. Push code to GitHub
2. New Web Service → connect repo
3. Build: `npm install` | Start: `node server.js`
4. Set environment variables in Render dashboard
5. Or use the included `render.yaml` for one-click deploy

### Railway
1. `railway init`
2. `railway add` → add MongoDB plugin
3. Set env vars in Railway dashboard
4. `railway up`

### MongoDB Atlas (Production DB)
1. Create free cluster at mongodb.com/cloud/atlas
2. Whitelist `0.0.0.0/0` (or Render IP)
3. Get connection string → set as `MONGO_URI`

---

## 🧪 Testing

```bash
# Run all tests
npm test

# With coverage report
npm run test:coverage
```

Tests cover:
- AuthService (register, login, password change)
- MenuService (CRUD, search, toggle availability)
- InventoryService (stock add/deduct, low stock)
- ApiResponse utility
- Helper functions (JWT, pagination, sorting)

---

## 🎫 Default Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@restaurant.com | Admin@123 |
| **Staff** | chef@restaurant.com | Staff@123 |
| **Customer** | alice@example.com | Customer@123 |

---

## 📊 What Gets Seeded

- **5 Users** (1 admin, 2 staff, 2 customers)
- **18 Inventory Items** (vegetables, dairy, grains, beverages)
- **10 Menu Items** (linked to inventory ingredients)
- **10 Tables** (2-10 seating, indoor/outdoor/private)

---

## 🔒 Security Features

- **Helmet** — sets 11 security HTTP headers
- **CORS** — whitelisted origin enforcement
- **Rate Limiting** — global (100 req/15min) + auth (20 req/15min)
- **Input Validation** — express-validator on all write endpoints
- **Password Hashing** — bcrypt with salt rounds 12
- **JWT** — short-lived tokens with role payload
- **Soft Delete** — users are deactivated, not wiped
- **Mongoose** — parameterized queries prevent NoSQL injection
- **Non-root Docker** — runs as `restaurant` user (UID 1001)

---

## 🗺️ Roadmap / Future Enhancements

- [ ] Redis caching for menu and analytics
- [ ] Webhook for payment gateway (Razorpay/Stripe)
- [ ] Staff shift scheduling module
- [ ] Customer loyalty points system
- [ ] Multi-branch support
- [ ] GraphQL API layer
- [ ] Admin React dashboard

---

*Built as a production-grade backend — not a beginner CRUD project.* 🚀
