# Project Context for AI Assistants

> **Read this first.** This file gives you complete context to resume development on this project.

## Quick Setup (New Machine)

```bash
# Only requirement: Docker must be installed and running
cd municipal-corp-property-management-system
./setup.sh
# That's it. App will be at http://localhost:5173 in ~90 seconds.
```

## What Is This Project?

**Municipal Corp Property Management System** — a municipal property tax management web application. Think of it as an internal tool for a city/town government to:
- Register properties and their owners
- Calculate property tax using ARV (Annual Rental Value) methodology
- Collect payments (online + offline)
- Handle disputes and citizen grievances
- Manage staff, wards, roads, and tax configurations

## Origin Story

This was reverse-engineered from a live production app at https://ptmsbirpur.in (Nagar Panchayat Birpur, Bihar, India). The owner wanted a rebranded clone for a different municipality. We browsed every page of the original, documented all features, and rebuilt from scratch.

**Important:** We started with Next.js 16 + React 19 but migrated to Express + Vite + React 18 because Next.js 16 had severe hydration issues, 2.3GB memory usage, and useEffect not firing. The current stack is stable and uses ~200MB.

## Tech Stack

```
Frontend: Vite 5 + React 18 + React Router 6 (SPA)
Backend:  Express.js 4 (REST API)
Database: PostgreSQL 16 (via Prisma 5 ORM)
Auth:     JWT (jose library), httpOnly cookie
Logging:  Pino (structured JSON in production)
Validation: Zod schemas on API inputs
Container: Docker (node:20-bookworm + postgres:16-alpine)
Theme:    Sunset warm (#e05d36 primary), glass-effect UI
```

## How To Run

```bash
# Requires: Docker + Docker Compose
docker compose up -d

# Wait ~60s for npm install + prisma generate on first run
# Frontend: http://localhost:5173 (Vite dev server, proxies /api to Express)
# Backend:  http://localhost:3001 (Express API)
# Health:   http://localhost:3001/api/health
```

## Login Credentials

**Officers (email + password on Officer tab):**
- admin@demo.com / Admin@123 (ADMIN — full access)
- rajesh@municipality.gov / Officer@123 (EO)
- priya@municipality.gov / Officer@123 (HC)
- amit@municipality.gov / Officer@123 (TI)
- manoj@municipality.gov / Officer@123 (GO)

**Citizens (mobile + password on Citizen tab):**
- 7001234501 / Citizen@123 (Ramesh Prasad)
- 7001234502 / Citizen@123 (Sita Kumari)
- Any 700123450X / Citizen@123

## Project Structure

```
server/                         # Express.js backend
├── index.ts                    # App entry: middleware, routes, error handling, graceful shutdown
├── lib/
│   ├── config.ts               # Environment-based configuration
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # JWT create/verify, requireAuth, requireRole middleware
│   ├── audit.ts                # Audit log writer (logs to DB with IP + user agent)
│   ├── logger.ts               # Pino structured logger + request logging middleware
│   ├── errors.ts               # AppError class, asyncHandler, notFoundHandler, errorHandler
│   ├── validate.ts             # Zod schemas (login, register, property, assessment, payment)
│   └── rate-limit.ts           # IP-based rate limiting (auth: 10/15min, API: 100/min)
├── routes/
│   ├── auth.ts                 # POST /login, /citizen-login, /register-simple, /logout, /me, /change-password, /admin-reset-password
│   ├── crud.ts                 # Generic CRUD factory — handles 20+ masterdata tables
│   ├── assessments.ts          # Assessment CRUD + workflow (submit/approve/reject + auto demand generation)
│   ├── payments.ts             # Payment CRUD + offline payment update
│   ├── dashboard.ts            # Dashboard KPI stats (demand, collection, assessments, pending)
│   └── health.ts               # Health check (DB ping, memory, uptime)

client/                         # Vite + React 18 frontend
├── index.html                  # Vite entry point
├── src/
│   ├── main.tsx                # React root + CSS import
│   ├── App.tsx                 # React Router: public routes, protected routes, all 30+ page routes
│   ├── styles.css              # Global CSS: .glass, .btn, .input, .table, .badge, .kpi-card, responsive
│   ├── lib/
│   │   ├── auth.tsx            # AuthProvider context (login/logout/refresh, user state)
│   │   └── api.ts              # Fetch helpers: api(), apiPost(), apiPut()
│   └── pages/
│       ├── Home.tsx            # Public landing page
│       ├── Login.tsx           # Officer (email+pw) + Citizen (mobile+pw) tabs
│       ├── Register.tsx        # Citizen self-registration (name+mobile+password)
│       ├── ForgotPassword.tsx  # Contact admin page
│       ├── DashboardLayout.tsx # Sidebar + main content + role-based nav
│       ├── Dashboard.tsx       # KPI cards, collection rate chart, recent assessments
│       ├── DataPage.tsx        # Reusable table component (search, add, edit, delete, export, pagination, row links)
│       ├── ManageForms.tsx     # Assessment workflow with Submit/Approve/Reject buttons
│       ├── Disputes.tsx        # Dispute management with status change buttons
│       ├── Grievances.tsx      # Grievance management with status change buttons
│       ├── NewAssessment.tsx   # Multi-section property + assessment form
│       ├── PropertyDetail.tsx  # Property detail view (owner, location, assessment history)
│       ├── UpdatePayment.tsx   # Offline payment form (demand ID + mode)
│       ├── Settings.tsx        # System feature toggles
│       ├── ChangePassword.tsx  # Password change form
│       └── ArvMatrix.tsx       # ARV rate matrix (road x construction x usage)

prisma/
├── schema.prisma               # 32 tables (see Database section)
├── migrations/                 # Auto-generated migration files
└── seed/
    ├── seed.ts                 # Base seed: wards, roads, ARV rates, tax config, admin user
    ├── demo-data.ts            # Demo seed: officers, citizens, properties, assessments, payments, disputes, grievances, website content
    └── add-citizen-passwords.ts # Adds passwords to seeded citizens
```

## Database (32 Tables)

**Core:** User, Property, Assessment, Demand, Payment, Dispute, Grievance, Staff, StaffWardAssignment
**Masterdata:** Ward, Road, AssessmentYear, ArvRate, PropertyTaxRate, OccupancyTypeConfig, UsageTypeConfig, UsageFactorConfig, DiscountTypeConfig, InterestRateConfig, SolidWasteCharge, VacantLandTaxRate, VacantLandThreshold, SystemSetting
**Auth:** OtpVerification, AuditLog
**CMS:** WebsiteContent, HelplineNumber, UsefulLink, OfficerProfile, WebsiteAboutUs, WebsiteService

## Demo Data Currently Loaded

- 24 users (1 admin, 7 officers, 17 citizens)
- 22 properties across 13 wards, linked to roads
- 21 assessments (APPROVED/SUBMITTED/DRAFT mix)
- 8+ demands, 7 payments (Rs.18,854 total demand, 99% collection)
- 5 disputes, 6 grievances (various statuses)
- 13 wards, 10 roads, 27 ARV rates, all tax config tables seeded
- Website content: 6 items, 4 helplines, 3 links, 4 officer profiles, 6 services
- 70+ audit log entries

## User Roles

| Role | Access | Route |
|------|--------|-------|
| ADMIN/EO | Everything — all pages, all data, approve assessments, manage users | /eo/* |
| HC (Head Clerk) | Forms, assessments, payments, properties, citizens | /eo/* (limited sidebar) |
| TI (Tax Inspector) | Forms, assessments, properties, field work | /eo/* (limited sidebar) |
| GO (Grievance Officer) | Only grievances | /eo/* (only grievances) |
| USER (Citizen) | Own properties, file assessments, view status | /eo/* (limited sidebar) |

## API Endpoints (30+)

All under `/api/`. Auth via httpOnly cookie `auth-token`.

**Auth:** POST /login, /citizen-login, /register-simple, /logout, /change-password, /admin-reset-password · GET /me
**Data:** GET/POST/PUT/DELETE on /wards, /roads, /properties, /assessments, /payments, /disputes, /grievances, /staffs, /users/citizens, /users/officials, /audit-logs
**Masterdata:** /arv-rates, /property-tax-rate, /occupancy-types, /usage-types, /usage-factors, /discount-types, /interest-rate, /solid-waste-charges, /vacant-land-tax-rates, /vacant-land-threshold, /settings, /assessment-years
**CMS:** /website-content/contents, /helpline-numbers, /links, /officers-profile, /services
**Util:** GET /health, GET /export?type=X, GET /dashboard/stats

## Critical Rules / Gotchas

1. **Heroku aliases:** The developer's shell has Heroku CLI aliases that intercept `docker` flags (-a, -t). If `docker exec` or `docker logs` fails with Heroku errors, use Docker API via Unix socket instead.
2. **Cookie auth:** Login sets httpOnly cookie. Frontend uses `credentials: "include"` on all fetches. Vite proxies `/api/*` to Express on port 3001.
3. **Prisma on Docker:** Needs OpenSSL. Alpine images lack it. Use `node:20-bookworm` (Debian) — NOT alpine.
4. **Login redirect:** Use `window.location.href = "/eo"` after login (not React Router navigate) for reliable cookie propagation.
5. **File changes in Docker:** After editing server files, the `tsx watch` auto-restarts. If it crashes, run `docker compose restart app`.

## What's Complete

- ✅ Dual login (officer email+pw, citizen mobile+pw)
- ✅ Citizen self-registration with password
- ✅ Role-based sidebar (different nav per role)
- ✅ 30+ API endpoints with Zod validation
- ✅ CRUD: add, edit, delete, search, CSV export on all tables
- ✅ Assessment workflow (Draft → Submit → Approve/Reject → demand auto-generation)
- ✅ Dispute + Grievance resolution buttons (In Progress/Resolve/Reject/Close)
- ✅ Property detail view (click row → full info + assessment history)
- ✅ Dashboard with KPI cards, collection rate chart, recent assessments
- ✅ Comprehensive audit logging (login, register, all CRUD, workflow actions)
- ✅ Health check endpoint (/api/health)
- ✅ Structured logging (Pino)
- ✅ Rate limiting (auth: 10/15min, API: 100/min)
- ✅ Error handling (AppError, asyncHandler, 404 handler)
- ✅ Environment config (server/lib/config.ts)
- ✅ Production Dockerfile (multi-stage build)
- ✅ Global CSS file (styles.css)
- ✅ Homepage, register, forgot-password pages
- ✅ Dark mode toggle (basic)
- ✅ Mobile responsive CSS

## What's Pending

### Phase 1: Code Quality (Priority: High)
- [ ] Replace all TypeScript `any` with proper interfaces
- [ ] Migrate remaining inline styles to CSS classes from styles.css
- [ ] Extract tax calculation into `server/services/tax-calculator.ts`
- [ ] Extract demand generation into `server/services/demand-service.ts`
- [ ] Unit tests for tax calculation, auth middleware, Zod validation
- [ ] Integration tests for login flow, assessment workflow

### Phase 2: Deployment (Priority: High)
- [ ] Deploy to VPS/cloud (Railway, Fly.io, DigitalOcean)
- [ ] Set up real domain + SSL certificate
- [ ] Managed PostgreSQL (Supabase, Neon, or RDS)
- [ ] Log aggregation service
- [ ] CI/CD pipeline (GitHub Actions)

### Phase 3: External Integrations (Needs API Keys)
- [ ] **OTP/SMS** for citizen mobile login — needs Fast2SMS or Twilio key
- [ ] **Razorpay** for online tax payment — needs Key ID + Secret
- [ ] **Cloudinary** for document/image uploads — needs Cloud Name + API Key
- [ ] **Resend** for email notifications — needs API Key

### Phase 4: Polish
- [ ] PDF receipt generation for payments
- [ ] Bulk CSV import for properties
- [ ] Dashboard charts (monthly trend line)
- [ ] Full dark mode theme (all components)
- [ ] Email-based forgot password flow
- [ ] Notification bell for pending approvals
- [ ] Auto-logout on session expiry

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
AUTH_SECRET=your-jwt-secret-min-32-chars
PORT=3001
NODE_ENV=development|production
LOG_LEVEL=debug|info|warn|error
CORS_ORIGIN=true|https://yourdomain.com
# Future:
FAST2SMS_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
```
