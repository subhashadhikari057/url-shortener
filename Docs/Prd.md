# URL Shortener + Analytics Dashboard

**Stack:** NestJS · Next.js · PostgreSQL · Redis · Docker  
**Timeline:** 1 Week  
**Difficulty:** Medium

---

## Overview

A public-facing URL shortener with sub-10ms redirects and a real-time analytics dashboard. The goal is to build something live on a real domain that actual users can interact with — demonstrating full-stack range, Redis caching strategy, and event-driven analytics.

---

## Goals

- Shorten any URL with optional custom slug and expiry
- Redirect with sub-10ms latency using Redis cache
- Track click events: timestamp, country, referrer, device
- Display real-time analytics in a Next.js dashboard
- Enforce per-IP rate limiting to prevent abuse
- Deploy publicly — Vercel (frontend) + VPS (backend)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | NestJS |
| Frontend | Next.js |
| Database | PostgreSQL |
| Cache | Redis |
| Containerization | Docker |

---

## Architecture

| Component | Description |
|---|---|
| **API Layer** | NestJS REST API — shorten, redirect, analytics endpoints |
| **Cache Layer** | Redis — redirect cache (TTL=24h), click counter buffer |
| **Database** | PostgreSQL — links table, click_events table |
| **Frontend** | Next.js — dashboard with Recharts, deployed on Vercel |
| **Rate Limiting** | Redis sliding window — 10 requests/min per IP |
| **Geo Tracking** | ip-api.com free tier — IP to country resolution |
| **Deployment** | Docker Compose locally, VPS for API, Vercel for UI |

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/links` | Create short link — body: `{ url, slug?, expiresAt? }` |
| `GET` | `/:slug` | Redirect — lookup Redis first, fallback to PostgreSQL |
| `GET` | `/links/:id/stats` | Analytics for a single link — clicks, countries, referrers |
| `GET` | `/links` | List all links for authenticated user |
| `DELETE` | `/links/:id` | Delete a link |
| `GET` | `/health` | Health check endpoint |

---

## Data Models

### `links` table

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `slug` | VARCHAR(20) | Unique — custom or auto-generated |
| `original_url` | TEXT | Not null |
| `user_id` | UUID | Foreign key (nullable for anonymous) |
| `expires_at` | TIMESTAMP | Nullable |
| `created_at` | TIMESTAMP | Default now() |

### `click_events` table

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `link_id` | UUID | Foreign key → links |
| `country` | VARCHAR(2) | ISO country code |
| `referrer` | TEXT | Nullable |
| `device` | VARCHAR(20) | mobile / desktop / tablet |
| `clicked_at` | TIMESTAMP | Default now() |

---

## Redis Strategy

| Key Pattern | Value | Purpose |
|---|---|---|
| `redirect:{slug}` | `original_url` | TTL 24h — populated on first hit, eliminates DB read on every redirect |
| `ratelimit:{ip}` | Sliding window counter | Expires every 60s — atomic INCR + EXPIRE |
| `clicks:{link_id}` | Integer counter | Flushed to PostgreSQL every 60s via cron job |

---

## Build Phases

| Week | Phase | Tasks |
|---|---|---|
| 1 | **Backend Core** | NestJS setup, PostgreSQL schema, shorten + redirect endpoints, Redis cache |
| 2 | **Analytics + Rate Limiting** | Click event tracking, geo resolution, per-IP rate limiting, analytics endpoint |
| 3 | **Frontend + Deploy** | Next.js dashboard, Recharts graphs, Vercel deploy, VPS backend deploy, real domain |

---

## Resume Signal

- **Sub-10ms redirects** demonstrates Redis caching strategy — a real performance outcome
- **Event-driven analytics** shows you understand write-heavy workloads and batching
- **Live on a real domain** — interviewers can use it during the interview itself
- **Per-IP rate limiting** reinforces the same skill claimed in Nomor LLC bullets