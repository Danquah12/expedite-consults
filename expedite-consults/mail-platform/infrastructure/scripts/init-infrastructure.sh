#!/usr/bin/env bash
set -e

# ==============================================================================
# One-Click Stack Initialization for Local Development & CI
# ==============================================================================

echo "==> [1/3] Starting containerized email infrastructure..."
docker compose -f docker-compose.yml up -d postgres redis minio mailpit

echo "==> [2/3] Waiting for PostgreSQL readiness..."
until docker exec axiom-postgres pg_isready -U mailuser -d mailserver; do
  echo "Waiting for database..."
  sleep 2
done

echo "==> [3/3] Infrastructure is ready!"
echo ""
echo "Access Points:"
echo "--------------------------------------------------------"
echo "  • PostgreSQL:    localhost:5432 (Database: mailserver, User: mailuser)"
echo "  • Redis:         localhost:6379"
echo "  • MinIO Console: http://localhost:9001 (User: minioadmin / Pass: minioadminpassword123)"
echo "  • Mailpit UI:    http://localhost:8025 (Mock SMTP Web Inbox)"
echo "  • SMTP Ingress:  localhost:1025"
echo "--------------------------------------------------------"
