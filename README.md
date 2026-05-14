# Municipal Corp Property Management System

Municipal property tax management — register properties, calculate taxes, collect payments, handle disputes.

## Quick Start

Clone or open the repo folder `municipal-corp-property-management-system`, then:

```bash
docker compose up -d
# Wait ~60s for first startup
open http://localhost:5173
```

**Login:** admin@demo.com / Admin@123

## Stack

Express.js 4 · Vite 5 · React 18 · Prisma 5 · PostgreSQL 16 · Docker

## Architecture

```
Browser → Vite:5173 → /api/* proxy → Express:3001 → PostgreSQL:5433
```

- **15 server files** (routes, auth, logging, validation, rate limiting)
- **21 client files** (16 pages, auth context, API helpers, CSS)
- **32 database tables** (Prisma ORM)
- **~200MB RAM** total

## Credentials

| Role | Login | Password |
|------|-------|----------|
| Admin | admin@demo.com | Admin@123 |
| Officer | rajesh@municipality.gov | Officer@123 |
| Citizen | 7001234501 | Citizen@123 |

## Development

```bash
docker compose up -d            # Start
docker compose restart app      # Restart after code changes
docker compose down             # Stop
docker logs -f municipal-pms-app  # View logs
```

## For AI Assistants

Read `CLAUDE.md` for complete project context, architecture, current status, and next steps.
