#!/usr/bin/env bash
set -e

# ==============================================================================
# DKIM Key Generation Script for AxiomMail / Mail Platform
# ==============================================================================

DOMAIN="${1:-yourdomain.com}"
SELECTOR="${2:-default}"
DKIM_DIR="/var/lib/rspamd/dkim"

echo "==> Generating 2048-bit DKIM Key for Domain: ${DOMAIN} (Selector: ${SELECTOR})..."

mkdir -p "${DKIM_DIR}"
rspamadm dkim_keygen -b 2048 -s "${SELECTOR}" -d "${DOMAIN}" -k "${DKIM_DIR}/${DOMAIN}.${SELECTOR}.key" > "/tmp/${DOMAIN}.${SELECTOR}.txt"

chown -R _rspamd:_rspamd "${DKIM_DIR}"
chmod 0400 "${DKIM_DIR}"/*

echo "==> DKIM Key successfully generated!"
echo "=============================================================================="
echo "Publish the following TXT record into your DNS Zone:"
echo "=============================================================================="
cat "/tmp/${DOMAIN}.${SELECTOR}.txt"
echo "=============================================================================="
