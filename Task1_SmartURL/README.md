# SmartURL - Advanced URL Shortener & Analytics Platform

A production-ready, full-stack backend for a URL shortening platform (similar to Bitly/TinyURL) built with **Node.js**, **Express.js**, and **MongoDB**. It includes JWT authentication, custom aliases, QR code generation, click analytics, URL expiry, rate limiting, and a full admin panel.

---

## ✨ Features

- **Authentication** — Register/Login with JWT, bcrypt password hashing, profile management, password change, role-based access (`user` / `admin`)
- **URL Shortener** — Create short URLs, custom aliases, edit/delete, activate/deactivate, favorites, tags & categories
- **Redirection Engine** — Resolves short codes, checks active/expiry status, logs analytics, supports password-protected links
- **Analytics** — Total/daily/weekly/monthly clicks, browser/OS/device breakdown, click heatmap, recent visitors, CSV export, top URLs
- **QR Codes** — Auto-generated for every short URL, viewable, downloadable, regeneratable
- **URL Expiry** — 1 day / 7 days / 30 days / custom date / never
- **Security** — Helmet, CORS, rate limiting, Mongo sanitize, XSS protection
- **Admin Panel** — Manage users (block/unblock/delete), manage all URLs, global dashboard statistics
- **Search & Filter** — Search by URL/short code/alias, filter by status/category/tag/date range, full pagination & sorting
- **Bulk Operations** — Create multiple short URLs in one request
- **API Documentation** — Full Swagger/OpenAPI docs at `/api-docs`
- **Public API Key** — Generate an API key for programmatic access

---

## 🛠 Tech Stack

| Layer            | Technology                          |
|------------------|--------------------------------------|
| Runtime          | Node.js                              |
| Framework        | Express.js                           |
| Database         | MongoDB Atlas + Mongoose             |
| Auth             | JWT + bcryptjs                       |
| Validation       | express-validator                    |
| QR Codes         | qrcode                               |
| Security         | helmet, cors, express-rate-limit, express-mongo-sanitize, xss-clean |
| Logging          | morgan + custom logger               |
| Docs             | swagger-jsdoc + swagger-ui-express   |
| CSV Export       | json2csv                             |

---

## 📁 Project Structure

```
smarturl/
├── src/
│   ├── config/          # DB connection, constants, swagger config
│   ├── controllers/      # Route handler logic (auth, url, redirect, analytics, admin)
│   ├── middleware/        # auth, error handling, rate limiting, validation
│   ├── models/            # Mongoose schemas (User, Url, Analytics)
│   ├── routes/            # Express routers
│   ├── services/          # Business logic (urlService, qrService, analyticsService)
│   ├── utils/              # Helpers (ApiError, ApiResponse, asyncHandler, etc.)
│   ├── validations/        # express-validator rule sets
│   └── app.js              # Express app configuration
├── uploads/
│   └── qrcodes/            # Generated QR code images
├── .env.example
├── server.js               # Entry point
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Clone & Install

```bash
git clone <repo-url>
cd smarturl
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smarturl

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

SHORT_CODE_LENGTH=7
```

### 3. Run the Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

### 4. (Optional) Seed an Admin User

```bash
npm run seed
```
Creates `admin@smarturl.com` / `Admin@123` if no admin exists yet.

### 5. Open API Docs

Visit: `http://localhost:5000/api-docs`

---

## 🔑 Authentication Flow

1. `POST /api/auth/register` → returns a JWT token
2. `POST /api/auth/login` → returns a JWT token
3. Include the token in subsequent requests:
   ```
   Authorization: Bearer <token>
   ```

---

## 📌 API Endpoints Overview

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/profile` | Private |
| PUT | `/api/auth/profile` | Private |
| PUT | `/api/auth/change-password` | Private |
| POST | `/api/auth/api-key` | Private |

### URLs
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/urls` | Private |
| POST | `/api/urls/bulk` | Private |
| GET | `/api/urls` | Private |
| GET | `/api/urls/:id` | Private |
| PUT | `/api/urls/:id` | Private |
| DELETE | `/api/urls/:id` | Private |
| PATCH | `/api/urls/:id/activate` | Private |
| PATCH | `/api/urls/:id/deactivate` | Private |
| PATCH | `/api/urls/:id/favorite` | Private |
| GET | `/api/urls/:id/qr` | Private |
| POST | `/api/urls/:id/qr/regenerate` | Private |

### Redirection
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/:shortCode` | Public |

### Analytics
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/analytics` | Private |
| GET | `/api/analytics/top-urls` | Private |
| GET | `/api/analytics/:urlId` | Private |
| GET | `/api/analytics/:urlId/history` | Private |
| GET | `/api/analytics/:urlId/export` | Private |

### Admin (requires `role: admin`)
| Method | Endpoint |
|--------|----------|
| GET | `/api/admin/stats` |
| GET | `/api/admin/users` |
| DELETE | `/api/admin/users/:id` |
| PATCH | `/api/admin/users/:id/block` |
| PATCH | `/api/admin/users/:id/unblock` |
| GET | `/api/admin/urls` |
| DELETE | `/api/admin/urls/:id` |

---

## 🧱 Database Models

### User
`name`, `email`, `password`, `role (user|admin)`, `isBlocked`, `apiKey`, `createdAt`, `updatedAt`

### Url
`originalUrl`, `shortCode`, `customAlias`, `owner`, `clickCount`, `isActive`, `expiryDate`, `qrCode`, `tags`, `category`, `isFavorite`, `password`, `lastClickedAt`, `createdAt`, `updatedAt`

### Analytics
`urlId`, `ip`, `country`, `browser`, `os`, `device`, `referrer`, `clickedAt`

---

## 🛡 Security Measures

- **Helmet** — sets secure HTTP headers
- **CORS** — configurable cross-origin access
- **express-rate-limit** — 100 requests / 15 min globally, stricter limits on auth & redirect routes
- **express-mongo-sanitize** — prevents NoSQL injection
- **xss-clean** — sanitizes user input against XSS
- **bcryptjs** — secure password hashing (and URL access-password hashing)
- **JWT** — stateless authentication with expiry

---

## 📤 Postman Collection

Import `SmartURL.postman_collection.json` into Postman. Set the `baseUrl` and `token` collection variables (the token is captured automatically after login/register via a response script).

---

## 📄 License

MIT
