#!/bin/bash
# ==============================================
# Municipal Corp Property Management System — One-Command Setup
# ==============================================
# Usage: ./setup.sh
# Requires: Docker + Docker Compose
# ==============================================

set -e
set -o pipefail

echo ""
echo "🏗️  Municipal Corp Property Management System — Setup"
echo "======================================"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Install it first:"
  echo "   curl -fsSL https://get.docker.com | sh"
  echo "   sudo usermod -aG docker \$USER && newgrp docker"
  exit 1
fi

if ! docker info &> /dev/null 2>&1; then
  echo "❌ Docker daemon not running. Start Docker Desktop or run: sudo systemctl start docker"
  exit 1
fi

echo "✅ Docker found: $(docker --version | head -1)"

# Start containers
echo ""
echo "📦 Starting containers..."
docker compose up -d 2>&1 | tail -5

# Wait for DB to be healthy
echo ""
echo "⏳ Waiting for database..."
for i in $(seq 1 30); do
  if docker compose exec db pg_isready -U demo_user -d demo_docker_learning &> /dev/null; then
    echo "✅ Database ready"
    break
  fi
  sleep 2
done

# Wait for app to install dependencies and start
echo ""
echo "⏳ Waiting for app (npm install + prisma generate)..."
echo "   This takes ~60-90 seconds on first run..."
for i in $(seq 1 60); do
  if curl -s http://localhost:3001/api/health &> /dev/null; then
    echo "✅ Express server ready"
    break
  fi
  if [ $i -eq 60 ]; then
    echo "⚠️  Server not ready yet. Check logs: docker logs municipal-pms-app"
  fi
  sleep 3
done

# Apply database schema (required before seed / login)
echo ""
echo "🗄️  Applying Prisma migrations..."
docker compose exec -T app npx prisma migrate deploy

# Check if DB has data
echo ""
echo "📊 Checking database..."
HAS_DATA=$(curl -s http://localhost:3001/api/health 2>/dev/null | grep -o '"status":"healthy"' || echo "")

if [ -z "$HAS_DATA" ]; then
  echo "⚠️  Server not responding yet. Waiting 30 more seconds..."
  sleep 30
fi

# Check if wards exist (seeded or not)
WARD_CHECK=$(curl -s -c /tmp/setup-cookie.txt -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d '{"email":"admin@demo.com","password":"Admin@123"}' 2>/dev/null | grep -o '"success":true' || echo "")

if [ -z "$WARD_CHECK" ]; then
  echo ""
  echo "🌱 Seeding database (first time)..."
  docker compose exec -T app npx tsx prisma/seed/seed.ts
  docker compose exec -T app npx tsx prisma/seed/demo-data.ts
  docker compose exec -T app npx tsx prisma/seed/add-citizen-passwords.ts
  echo "✅ Database seeded with demo data"
else
  echo "✅ Database already has data"
fi

# Final check
echo ""
echo "🔍 Final verification..."
HEALTH=$(curl -s http://localhost:3001/api/health 2>/dev/null)
if echo "$HEALTH" | grep -q '"healthy"'; then
  echo "✅ Health check passed"
else
  echo "⚠️  Health check failed. Check: docker logs municipal-pms-app"
fi

VITE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null)
if [ "$VITE" = "200" ]; then
  echo "✅ Frontend ready"
else
  echo "⚠️  Frontend not ready yet (may still be starting)"
fi

# Print summary
echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "🌐 Frontend:  http://localhost:5173"
echo "🔌 API:       http://localhost:3001"
echo "💚 Health:    http://localhost:3001/api/health"
echo ""
echo "👤 Admin:     admin@demo.com / Admin@123"
echo "👔 Officer:   rajesh@municipality.gov / Officer@123"
echo "👥 Citizen:   7001234501 / Citizen@123"
echo ""
echo "📖 For AI:    Read CLAUDE.md for full project context"
echo "📋 Status:    See STATUS.md for what's done vs pending"
echo ""
echo "Commands:"
echo "  docker compose up -d        # Start"
echo "  docker compose restart app  # Restart after code changes"
echo "  docker compose down         # Stop"
echo "  docker logs -f municipal-pms-app  # View logs"
echo ""
