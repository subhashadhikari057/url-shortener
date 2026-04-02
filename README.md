<div align="center">

<pre>
██╗   ██╗██████╗ ██╗     ███████╗██╗  ██╗██████╗ 
██║   ██║██╔══██╗██║     ██╔════╝╚██╗██╔╝██╔══██╗
██║   ██║██████╔╝██║     ███████╗ ╚███╔╝ ██████╔╝
██║   ██║██╔══██╗██║     ╚════██║ ██╔██╗ ██╔══██╗
╚██████╔╝██║  ██║███████╗███████║██╔╝ ██╗██║  ██║
 ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
</pre>

**A high-performance URL shortener with sub-10ms redirects and real-time analytics**

[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)

[Live Demo](https://urlsx.vercel.app) · [API Docs](https://urlsx-api.up.railway.app/docs) · [Frontend Repo](https://github.com/subhashadhikari057/url-shortener-web)

</div>

---

## Overview

URLSX is a production-grade URL shortener built with NestJS, PostgreSQL, and Redis. It handles link creation, sub-10ms cached redirects, per-IP rate limiting, and real-time click analytics including geographic distribution and referrer tracking.

Built as a portfolio project to demonstrate distributed system design, caching strategy, and event-driven architecture.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│              Next.js Dashboard  /  REST API                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    NESTJS API                               │
│                                                             │
│   ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│   │   Links     │  │  Analytics   │  │   Auth / Guard  │  │
│   │  Module     │  │   Module     │  │   JWT + RBAC    │  │
│   └──────┬──────┘  └──────┬───────┘  └────────┬────────┘  │
│          │                │                    │            │
│   ┌──────▼────────────────▼────────────────────▼────────┐  │
│   │                  Redis Module                        │  │
│   │     Cache · Rate Limiter · Click Counter Buffer      │  │
│   └──────────────────────┬───────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
   ┌─────────────────┐       ┌─────────────────────┐
   │   PostgreSQL    │       │       Redis          │
   │                 │       │                      │
   │  links          │       │  redirect:{slug}     │
   │  click_events   │       │  ratelimit:{ip}      │
   │                 │       │  clicks:{id}         │
   └─────────────────┘       └─────────────────────┘
```

---

## Features

- **Sub-10ms redirects** — Redis-first lookup, PostgreSQL fallback
- **Custom slugs** — user-defined or nanoid-generated with collision detection
- **Link expiry** — optional TTL per link, auto-invalidated from cache
- **Real-time analytics** — click volume, geographic distribution, referrer tracking, device type
- **Per-IP rate limiting** — Redis sliding window, 10 requests/min
- **JWT authentication** — protected routes for link management
- **Click deduplication** — Redis buffered counters flushed to DB every 60s
- **Geo tracking** — IP-to-country resolution on every click event

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js 20 + TypeScript | Type-safe backend |
| Framework | NestJS 10 | Modular architecture, DI, guards |
| Database | PostgreSQL 16 + TypeORM | Persistent link + event storage |
| Cache | Redis 7 + ioredis | Redirect cache, rate limiting, counters |
| Auth | JWT + Passport | Stateless authentication |
| ID Generation | nanoid | URL-safe collision-resistant slugs |
| Containerization | Docker + Docker Compose | Local development environment |
| Deployment | Railway + Upstash | Production hosting |

---

## Project Structure

```
url-shortener-api/
├── src/
│   ├── links/
│   │   ├── links.module.ts
│   │   ├── links.controller.ts       # POST /links, GET /:slug, DELETE /links/:id
│   │   ├── links.service.ts          # Business logic, cache management
│   │   ├── links.entity.ts           # TypeORM entity
│   │   └── dto/
│   │       ├── create-link.dto.ts
│   │       └── link-response.dto.ts
│   ├── analytics/
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts   # GET /links/:id/stats
│   │   ├── analytics.service.ts      # Click recording, geo resolution, aggregation
│   │   └── click-event.entity.ts
│   ├── redis/
│   │   ├── redis.module.ts           # Global Redis module
│   │   └── redis.service.ts          # Cache, rate limit, counter methods
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts        # POST /auth/login, POST /auth/register
│   │   ├── auth.service.ts
│   │   └── guards/
│   │       └── jwt.guard.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   └── decorators/
│   │       └── current-user.decorator.ts
│   └── app.module.ts
├── test/
│   ├── links.e2e-spec.ts
│   └── analytics.e2e-spec.ts
├── .env.example
├── docker-compose.yml
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- npm or yarn

### 1. Clone and Install

```bash
git clone https://github.com/subhashadhikari057/url-shortener-api.git
cd url-shortener-api
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=urlshortener

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# App
PORT=3000
BASE_URL=http://localhost:3000

# Geo API (free, no key needed)
GEO_API_URL=http://ip-api.com/json
```

### 3. Start Infrastructure

```bash
docker-compose up -d
```

Verify containers are running:

```bash
docker ps
# Should show: postgres, redis
```

### 4. Run the API

```bash
# Development (watch mode)
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod
```

API is live at `http://localhost:3000`  
Swagger docs at `http://localhost:3000/docs`

---

## API Reference

### Auth

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

# Response
{
  "access_token": "eyJhbGci..."
}
```

---

### Links

```http
# Shorten a URL
POST /links
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/very/long/path",
  "slug": "my-link",         # optional
  "expiresAt": "2025-12-31"  # optional
}

# Response
{
  "id": "uuid",
  "slug": "my-link",
  "shortUrl": "http://localhost:3000/my-link",
  "originalUrl": "https://example.com/very/long/path",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

```http
# Redirect (public — no auth required)
GET /:slug
→ 302 redirect to original URL
```

```http
# List all links
GET /links
Authorization: Bearer <token>
```

```http
# Delete a link
DELETE /links/:id
Authorization: Bearer <token>
```

---

### Analytics

```http
# Get stats for a link
GET /links/:id/stats
Authorization: Bearer <token>

# Response
{
  "totalClicks": 1420,
  "uniqueCountries": 18,
  "topCountries": [
    { "country": "US", "clicks": 620 },
    { "country": "IN", "clicks": 310 },
    { "country": "GB", "clicks": 180 }
  ],
  "topReferrers": [
    { "referrer": "twitter.com", "clicks": 540 },
    { "referrer": "direct", "clicks": 320 }
  ],
  "clicksByDay": [
    { "date": "2025-01-01", "clicks": 120 },
    { "date": "2025-01-02", "clicks": 200 }
  ]
}
```

---

## Redis Strategy

| Key Pattern | Type | TTL | Purpose |
|---|---|---|---|
| `redirect:{slug}` | String | 24h | Redirect cache — eliminates DB read on every hit |
| `ratelimit:{ip}` | String | 60s | Sliding window counter for rate limiting |
| `clicks:{linkId}` | String | — | Buffered click counter, flushed to DB every 60s |
| `expire:{slug}` | String | link TTL | Tracks link expiry, triggers cache invalidation |

### Redirect Flow

```
Request GET /:slug
       │
       ▼
  Redis GET redirect:{slug}
       │
  ┌────┴────┐
  │  HIT    │  MISS
  │         │
  ▼         ▼
302       DB SELECT
Redirect  links WHERE slug = ?
          │
          ├── Not found → 404
          │
          └── Found → Redis SET (TTL 24h) → 302 Redirect
```

---

## Database Schema

```sql
-- Links table
CREATE TABLE links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(20) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_links_slug ON links(slug);
CREATE INDEX idx_links_user_id ON links(user_id);

-- Click events table
CREATE TABLE click_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id     UUID REFERENCES links(id) ON DELETE CASCADE,
  country     VARCHAR(2),
  referrer    TEXT,
  device      VARCHAR(20),
  clicked_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_click_events_link_id ON click_events(link_id);
CREATE INDEX idx_click_events_clicked_at ON click_events(clicked_at);
```

---

## Deployment

### Railway (API + PostgreSQL)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Set environment variables in Railway dashboard — same as `.env` but point `DATABASE_HOST` to Railway's internal PostgreSQL URL.

### Upstash (Redis)

1. Create free account at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the `REDIS_URL` from dashboard
4. Add to Railway environment variables:

```env
REDIS_URL=rediss://default:xxxx@xxx.upstash.io:6379
```

Update `redis.service.ts` to use `REDIS_URL` when available:

```typescript
const client = this.configService.get('REDIS_URL')
  ? new Redis(this.configService.get('REDIS_URL'))
  : new Redis({ host: redisHost, port: redisPort });
```

---

## Rate Limiting

All endpoints are protected with a global rate limiter. Redirect endpoint (`GET /:slug`) has a separate stricter limit.

| Endpoint | Limit | Window |
|---|---|---|
| `POST /links` | 20 requests | 1 minute |
| `GET /:slug` | 60 requests | 1 minute |
| `POST /auth/*` | 5 requests | 1 minute |
| All others | 30 requests | 1 minute |

Exceeded limits return:

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "retryAfter": 45
}
```

---

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests (requires Docker containers running)
npm run test:e2e

# Coverage report
npm run test:cov
```

---



<div align="center">
Built by <a href="https://www.subhashadhikari.dev">Subhash Chandra Adhikari</a>
</div>