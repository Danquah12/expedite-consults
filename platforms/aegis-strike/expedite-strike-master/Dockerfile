###############################################################################
# AEGIS Security Platform — Production Dockerfile
# =================================================
# Multi-stage build:
#   Stage 1  (tools-builder)  — downloads Go/Rust pre-built security binaries
#   Stage 2  (runtime)        — slim Debian with all tools + Python app
#
# Build:   docker build -t aegis:latest .
# Run:     docker run -p 9000:9000 -p 8050:8050 -p 8090:8090 aegis:latest
###############################################################################

# ─── Tool versions (single source of truth) ──────────────────────────────────
ARG SUBFINDER_VERSION=2.6.7
ARG HTTPX_VERSION=1.6.9
ARG NUCLEI_VERSION=3.3.7
ARG FEROXBUSTER_VERSION=2.11.0

# =============================================================================
# Stage 1: Download & extract pre-built security tool binaries
# =============================================================================
FROM debian:bookworm-slim AS tools-builder

ARG SUBFINDER_VERSION
ARG HTTPX_VERSION
ARG NUCLEI_VERSION
ARG FEROXBUSTER_VERSION

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates curl unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tools

# ── subfinder ────────────────────────────────────────────────────────────────
RUN curl -fsSL "https://github.com/projectdiscovery/subfinder/releases/download/v${SUBFINDER_VERSION}/subfinder_${SUBFINDER_VERSION}_linux_amd64.zip" \
        -o subfinder.zip \
    && unzip subfinder.zip -d subfinder_tmp \
    && mv subfinder_tmp/subfinder /tools/subfinder \
    && chmod +x /tools/subfinder \
    && rm -rf subfinder.zip subfinder_tmp

# ── httpx (ProjectDiscovery — NOT the Python httpx library) ──────────────────
RUN curl -fsSL "https://github.com/projectdiscovery/httpx/releases/download/v${HTTPX_VERSION}/httpx_${HTTPX_VERSION}_linux_amd64.zip" \
        -o httpx.zip \
    && unzip httpx.zip -d httpx_tmp \
    && mv httpx_tmp/httpx /tools/httpx-pd \
    && chmod +x /tools/httpx-pd \
    && rm -rf httpx.zip httpx_tmp

# ── nuclei ───────────────────────────────────────────────────────────────────
RUN curl -fsSL "https://github.com/projectdiscovery/nuclei/releases/download/v${NUCLEI_VERSION}/nuclei_${NUCLEI_VERSION}_linux_amd64.zip" \
        -o nuclei.zip \
    && unzip nuclei.zip -d nuclei_tmp \
    && mv nuclei_tmp/nuclei /tools/nuclei \
    && chmod +x /tools/nuclei \
    && rm -rf nuclei.zip nuclei_tmp

# ── feroxbuster ──────────────────────────────────────────────────────────────
RUN curl -fsSL "https://github.com/epi052/feroxbuster/releases/download/v${FEROXBUSTER_VERSION}/x86_64-linux-feroxbuster.zip" \
        -o feroxbuster.zip \
    && unzip feroxbuster.zip -d feroxbuster_tmp \
    && mv feroxbuster_tmp/feroxbuster /tools/feroxbuster \
    && chmod +x /tools/feroxbuster \
    && rm -rf feroxbuster.zip feroxbuster_tmp


# =============================================================================
# Stage 2: Production runtime image
# =============================================================================
FROM python:3.13-slim-bookworm AS runtime

LABEL maintainer="AEGIS Security Platform"
LABEL description="Ægis — Unified Vulnerability Intelligence & Security Operations Platform"
LABEL version="1.0.0"

# ── Prevent Python from buffering stdout/stderr and writing .pyc files ───────
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONPATH=/app
ENV PATH="/opt/tools:${PATH}"

# ── System packages: security tools, Java (ZAP), build deps ─────────────────
# Grouped logically; single RUN to minimise layers.
RUN apt-get update && apt-get install -y --no-install-recommends \
        # --- Security / recon tools ---
        nmap \
        traceroute \
        whois \
        dnsutils \
        snmp \
        net-tools \
        # --- Network utilities ---
        curl \
        wget \
        git \
        # --- Java runtime for OWASP ZAP proxy ---
        default-jre-headless \
        # --- Build dependencies for Python C-extensions ---
        gcc \
        g++ \
        libpq-dev \
        libffi-dev \
        libssl-dev \
        make \
        # --- Misc ---
        gnupg \
        ca-certificates \
        procps \
    && rm -rf /var/lib/apt/lists/*

# ── Copy pre-built Go/Rust binaries from builder stage ───────────────────────
COPY --from=tools-builder /tools/subfinder   /opt/tools/subfinder
COPY --from=tools-builder /tools/httpx-pd    /opt/tools/httpx-pd
COPY --from=tools-builder /tools/nuclei      /opt/tools/nuclei
COPY --from=tools-builder /tools/feroxbuster /opt/tools/feroxbuster

# ── Install sqlmap (latest stable via git) ───────────────────────────────────
RUN git clone --depth 1 https://github.com/sqlmapproject/sqlmap.git /opt/sqlmap \
    && ln -s /opt/sqlmap/sqlmap.py /usr/local/bin/sqlmap \
    && chmod +x /opt/sqlmap/sqlmap.py

# ── Create non-root user with security tool access ──────────────────────────
# The aegis user can still bind to nmap etc. via setuid/capabilities.
RUN groupadd --gid 1000 aegis \
    && useradd --uid 1000 --gid aegis --shell /bin/bash --create-home aegis

# ── Prepare working directory and scan mount points ──────────────────────────
WORKDIR /app

RUN mkdir -p /mnt/scans/incoming /mnt/scans/processed /mnt/scans/failed \
             /home/aegis/.config/nuclei \
             /app/logs \
             /app/reports \
             /app/outputs \
    && chown -R aegis:aegis /mnt/scans /home/aegis /app/logs /app/reports /app/outputs

# ── Python dependencies (cached layer — changes less often than app code) ────
COPY --chown=aegis:aegis requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r /app/requirements.txt

# ── Copy application code ───────────────────────────────────────────────────
COPY --chown=aegis:aegis . /app/

# ── Strip build-only packages to save ~200 MB ────────────────────────────────
RUN apt-get purge -y --auto-remove gcc g++ make \
    && rm -rf /var/lib/apt/lists/* /tmp/* /root/.cache

# ── Health check — verifies the launchpad server responds ────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -sf http://localhost:9000/ || exit 1

# ── Expose AEGIS service ports ───────────────────────────────────────────────
#   9000       — Mission Control Launchpad
#   8050       — Dash analytics UI
#   8090       — Admin / API gateway
#   9001-9020  — Micro-service suite (external assessment, red team, DFIR, etc.)
EXPOSE 8050 8090 9000-9020

# ── Drop to non-root for runtime ─────────────────────────────────────────────
USER aegis

# ── Default entrypoint ───────────────────────────────────────────────────────
CMD ["python", "launchpad_server.py"]
