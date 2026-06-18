# 🚀 Job Board Platform — Backend API

**CodeAlpha Internship Task 4** | Production-Level Node.js Backend

---

## 📌 Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express.js | Server & REST API |
| MongoDB + Mongoose | Database & ODM |
| JWT + bcryptjs | Auth & Password Hashing |
| Multer + Cloudinary | File Upload (Resume/Logo) |
| express-validator | Input Validation |
| node-cron | Job Expiry Automation |
| Nodemailer | Email Notifications |
| Winston | Logging |
| Helmet + Rate Limiting | Security |

---

## ⚙️ Setup & Installation

### 1. Clone & Install

```bash
cd job-board-platform
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

**Required:**
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret key for JWT signing

**Optional (features degrade gracefully if not set):**
- Cloudinary keys → uses local `uploads/` folder
- Nodemailer credentials → notifications skipped

### 3. Run

```bash
# Development
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000`

---

## 📁 Project Structure

```
src/
├── config/
│   ├── database.js         # MongoDB connection
│   └── cloudinary.js       # Cloudinary config
├── controllers/
│   ├── authController.js
│   ├── jobController.js
│   ├── applicationController.js
│   ├── candidateController.js
│   ├── employerController.js
│   └── adminController.js
├── middlewares/
│   ├── auth.js             # JWT protect + authorize
│   ├── errorHandler.js     # Global error handler
│   ├── upload.js           # Multer config
│   └── validate.js         # Validation result handler
├── models/
│   ├── User.js
│   ├── Employer.js
│   ├── Candidate.js
│   ├── Job.js
│   ├── Application.js
│   └── Notification.js
├── routes/
│   ├── authRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   ├── candidateRoutes.js
│   ├── employerRoutes.js
│   └── adminRoutes.js
├── services/
│   ├── emailService.js     # Nodemailer + notification creation
│   └── fileUploadService.js # Cloudinary + local fallback
├── utils/
│   ├── AppError.js         # Custom error class
│   ├── apiResponse.js      # Standard response helpers
│   ├── logger.js           # Winston logger
│   └── mongoSanitize.js    # Injection prevention
├── validators/
│   ├── authValidator.js
│   └── jobValidator.js
├── jobs/
│   └── jobExpiryScheduler.js # node-cron auto-close expired jobs
├── uploads/                # Local file storage (gitignored)
├── app.js                  # Express app setup
└── server.js               # Entry point
```

---

## 🔐 Authentication

All protected routes require:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

| Role | Permissions |
|---|---|
| `admin` | Full platform management, analytics |
| `employer` | Post/manage jobs, review applicants |
| `candidate` | Apply for jobs, manage profile |

---

## 📡 API Reference

### Auth Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get token |
| POST | `/api/auth/logout` | Protected | Logout |
| GET | `/api/auth/profile` | Protected | Get own profile |
| PATCH | `/api/auth/change-password` | Protected | Change password |

### Job Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/jobs` | Public | List all open jobs (paginated) |
| GET | `/api/jobs/search` | Public | Advanced job search |
| GET | `/api/jobs/suggestions?q=` | Public | Search autocomplete |
| GET | `/api/jobs/:id` | Public | Get job detail |
| POST | `/api/jobs` | Employer | Create job |
| PUT | `/api/jobs/:id` | Employer | Update job |
| DELETE | `/api/jobs/:id` | Employer | Delete job |
| GET | `/api/jobs/employer/myjobs` | Employer | My posted jobs |
| GET | `/api/jobs/employer/dashboard` | Employer | Dashboard stats |
| GET | `/api/jobs/employer/:id/applications` | Employer | Job applicants |

### Application Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/applications/apply/:jobId` | Candidate | Apply for job |
| GET | `/api/applications/candidate` | Candidate | My applications |
| GET | `/api/applications/candidate/dashboard` | Candidate | Dashboard stats |
| GET | `/api/applications/candidate/:id` | Candidate | Application detail |
| PATCH | `/api/applications/:id/status` | Employer | Update status |
| POST | `/api/applications/:id/notes` | Employer | Add recruiter note |

### Candidate Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/candidate/profile` | Candidate | Create profile |
| PUT | `/api/candidate/profile` | Candidate | Update profile |
| GET | `/api/candidate/profile` | Candidate | Get profile |
| POST | `/api/candidate/upload-resume` | Candidate | Upload PDF resume |
| POST | `/api/candidate/save-job/:jobId` | Candidate | Save/unsave job |
| GET | `/api/candidate/saved-jobs` | Candidate | Saved jobs list |
| GET | `/api/candidate/recently-viewed` | Candidate | Recently viewed |
| GET | `/api/candidate/skill-match/:jobId` | Candidate | Skill match % |

### Employer Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/employer/profile` | Employer | Get company profile |
| PUT | `/api/employer/profile` | Employer | Update company profile |
| POST | `/api/employer/upload-logo` | Employer | Upload company logo |
| GET | `/api/employer/company/:id` | Public | Public company page |

### Admin Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | Platform overview |
| GET | `/api/admin/analytics` | Admin | Full analytics |
| GET | `/api/admin/users` | Admin | All users |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| PATCH | `/api/admin/users/:id/toggle` | Admin | Activate/deactivate |
| GET | `/api/admin/jobs` | Admin | All jobs |
| DELETE | `/api/admin/jobs/:id` | Admin | Delete job |
| PATCH | `/api/admin/jobs/:id/feature` | Admin | Feature/unfeature job |

---

## 🔍 Job Search Filters

```
GET /api/jobs/search?keyword=developer&location=Mumbai&experienceLevel=mid&employmentType=full-time&salaryMin=500000&skills=Node.js,React&page=1&limit=10&sort=newest
```

**Sort options:** `newest`, `highest_salary`, `most_applications`

---

## 📊 Application Status Flow

```
applied → reviewed → shortlisted → interview_scheduled → selected
                                                       → rejected
```

Email notifications are sent to candidates on every status change.

---

## 🎯 Advanced Features

1. **Saved Jobs** — Candidates bookmark jobs
2. **Recently Viewed** — Auto-tracks last 20 viewed jobs
3. **Skill Match Score** — Returns % match between candidate skills and job requirements
4. **Job Expiry Automation** — Cron job closes expired jobs daily at midnight
5. **Application Timeline** — Full status history with timestamps
6. **Search Suggestions** — Autocomplete for job titles
7. **Featured Jobs** — Admin can promote jobs
8. **Recruiter Notes** — Private employer notes on applicants
9. **Company Profiles** — Dedicated public employer pages
10. **Dashboard Metrics** — Separate dashboards for employer and candidate

---

## 🛡️ Security

- Password hashing with bcrypt (12 salt rounds)
- JWT authentication on all protected routes
- Rate limiting (100 req/15min globally, 10/15min for auth)
- Helmet HTTP security headers
- MongoDB injection prevention (key sanitization)
- Input validation on all POST/PUT routes
- File type and size validation

---

## 📬 Postman Collection

Import `Job_Board_Postman_Collection.json` into Postman.

Set environment variable `{{base_url}}` to `http://localhost:5000/api` and `{{token}}` to your JWT after login.

---

## 🌐 Health Check

```
GET http://localhost:5000/health
```
