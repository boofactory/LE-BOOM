# Architecture LE BOOM v2

## Vue d'ensemble

LE BOOM v2 est une application web full-stack conteneurisée pour la gestion et le monitoring de photomatons BooFactory, avec intégration Notion pour la planification d'événements.

## Schéma d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                        │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Portainer  │    │  Tailscale   │    │    Nginx     │      │
│  │   (Docker)   │    │     VPN      │    │Proxy Manager │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              LE BOOM Web Application                    │     │
│  │                                                         │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │     │
│  │  │   Next.js   │  │  Socket.io  │  │   Prisma     │  │     │
│  │  │ App Router  │  │  WebSocket  │  │     ORM      │  │     │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │     │
│  │                                                         │     │
│  │  ┌──────────────────────────────────────────────────┐ │     │
│  │  │  API Routes                                       │ │     │
│  │  │  - /api/photomatons                              │ │     │
│  │  │  - /api/events                                   │ │     │
│  │  │  - /api/notion/sync                              │ │     │
│  │  │  - /api/webhooks/action                          │ │     │
│  │  │  - /api/agent/sync                               │ │     │
│  │  └──────────────────────────────────────────────────┘ │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ PostgreSQL  │  │    Redis    │  │   Uploads   │             │
│  │   Database  │  │    Cache    │  │   Volume    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└───────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                      INTEGRATION LAYER                           │
│                                                                   │
│  ┌─────────────┐  ┌──────────────────────────────────────────┐ │
│  │   Notion    │  │         Tailscale Network                 │ │
│  │     API     │  │                                           │ │
│  └─────────────┘  │  ┌──────────┐  ┌──────────┐  ┌────────┐ │ │
│                    │  │Photomaton│  │Photomaton│  │Routeur │ │ │
│                    │  │    PC    │  │    PC    │  │Telto.  │ │ │
│                    │  └──────────┘  └──────────┘  └────────┘ │ │
│                    │                                           │ │
│                    │  ┌──────────────────────────────────────┐│ │
│                    │  │  Agent Python (Phase 2)              ││ │
│                    │  │  - DSLR Booth listener               ││ │
│                    │  │  - SQLite local storage              ││ │
│                    │  │  - Sync avec API centrale            ││ │
│                    │  └──────────────────────────────────────┘│ │
│                    └──────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

## Stack Technologique

### Frontend
- **Framework**: Next.js 14 (App Router avec React Server Components)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3
- **Real-time**: Socket.io Client
- **State Management**: React Hooks + Context API
- **HTTP Client**: Native Fetch API

**Choix justifiés**:
- Next.js App Router: SSR, optimisations automatiques, API routes intégrées
- Tailwind: Rapid UI development, cohérent avec OLD_BOOM
- Socket.io: Real-time bidirectionnel fiable

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Next.js API Routes
- **WebSocket**: Socket.io Server
- **ORM**: Prisma 5
- **Validation**: Zod
- **Authentication**: NextAuth.js (préparé pour Infomaniak OAuth)

**Choix justifiés**:
- Next.js full-stack: Réduit la complexité (1 seul projet)
- Prisma: Type-safe, migrations automatiques, excellent DX
- Zod: Validation runtime avec inférence TypeScript

### Database & Cache
- **Database**: PostgreSQL 16 (Alpine)
- **Cache/Sessions**: Redis 7 (Alpine)
- **Backups**: Volumes persistants + Acronis (existant)

**Choix justifiés**:
- PostgreSQL: Robuste, JSONB pour données Notion, support avancé
- Redis: Cache rapide, sessions, pub/sub pour Socket.io clustering (future)

### Infrastructure
- **Containerisation**: Docker + Docker Compose
- **Orchestration**: Portainer
- **CI/CD**: GitHub Actions
- **Registry**: GitHub Container Registry (ghcr.io)
- **Réseau**: Tailscale VPN mesh
- **Reverse Proxy**: Nginx Proxy Manager (existant)

## Architecture de Données

### Modèle de Données (Prisma Schema)

```prisma
// Photomatons
model Photomaton {
  id                   Int       @id @default(autoincrement())
  name                 String
  hostname             String    @unique
  tailscaleIp          String
  routerTailscaleIp    String?

  // État
  routerConnected      Boolean   @default(false)
  pcConnected          Boolean   @default(false)
  lastSeen             DateTime?

  // Papier
  remainingPrints      Int       @default(700)
  warningThreshold     Int       @default(350)
  criticalThreshold    Int       @default(275)
  lastPrintUpdate      DateTime?

  // Relations
  events               Event[]
  speedTests           SpeedTest[]

  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

// Événements (synchronisés depuis Notion)
model Event {
  id                   Int       @id @default(autoincrement())
  notionPageId         String    @unique
  photomatonId         Int
  photomaton           Photomaton @relation(fields: [photomatonId], references: [id])

  // Données Notion
  clientName           String
  eventType            String?
  eventDate            DateTime?
  albumName            String?
  notionData           Json      // Snapshot complet Notion

  // Statistiques
  totalSessions        Int       @default(0)
  totalDigital         Int       @default(0)
  totalPrints          Int       @default(0)
  totalGifs            Int       @default(0)

  // Relations
  photos               Photo[]

  // État
  status               EventStatus @default(ACTIVE)
  syncedAt             DateTime  @default(now())
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

enum EventStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

// Photos/Médias
model Photo {
  id                   Int       @id @default(autoincrement())
  eventId              Int
  event                Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)

  mediaType            MediaType
  timestamp            DateTime  @default(now())

  // Métadonnées optionnelles
  metadata             Json?
}

enum MediaType {
  PHOTO
  DIGITAL
  PRINT
  GIF
}

// Tests de vitesse réseau
model SpeedTest {
  id                   Int       @id @default(autoincrement())
  photomatonId         Int
  photomaton           Photomaton @relation(fields: [photomatonId], references: [id])

  downloadSpeed        Float
  uploadSpeed          Float
  ping                 Float

  createdAt            DateTime  @default(now())
}

// Utilisateurs (Phase 2 - OAuth Infomaniak)
model User {
  id                   Int       @id @default(autoincrement())
  email                String    @unique
  name                 String?

  // OAuth
  infomaniakId         String?   @unique

  // Rôles
  role                 UserRole  @default(VIEWER)

  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

enum UserRole {
  ADMIN
  INSTALLER
  VIEWER
}

// Audit logs
model AuditLog {
  id                   Int       @id @default(autoincrement())
  userId               Int?
  action               String
  resource             String
  resourceId           Int?
  details              Json?
  ipAddress            String?

  createdAt            DateTime  @default(now())
}
```

### Flux de Données

#### 1. Synchronisation Notion → DB
```
Cron Job (5 min)
    ↓
GET /api/notion/sync
    ↓
NotionClient.getEvents()
    ↓
Filter: status = "En cours"
    ↓
Prisma.upsert(events)
    ↓
Socket.io broadcast "events:updated"
    ↓
Frontend updates UI
```

#### 2. Contrôle Photomaton
```
User clicks "Power On"
    ↓
POST /api/webhooks/action
    Body: { photomatonId, action: "power_on" }
    ↓
Validate user + photomaton exists
    ↓
Get router Tailscale IP
    ↓
Send Wake-on-LAN packet via Tailscale
    ↓
Update DB: photomaton.lastActionAt
    ↓
Socket.io broadcast "photomaton:action"
    ↓
Frontend shows loading → success/error
```

#### 3. Agent Sync (Phase 2)
```
Photomaton Agent (every 5 min if online)
    ↓
POST /api/agent/sync
    Body: {
      photomatonId,
      hostname,
      stats: [
        { type: "print", count: 5, timestamp: "..." },
        { type: "digital", count: 12, timestamp: "..." }
      ],
      paperLevel: 345,
      speedtest: { download, upload, ping }
    }
    ↓
Validate API key + photomaton
    ↓
Prisma.transaction {
      Update photomaton (paper, lastSeen)
      Insert photos batch
      Insert speedtest
    }
    ↓
Socket.io broadcast "photomaton:updated"
    ↓
Agent purges local SQLite
```

## Sécurité

### Authentification (Phase 1 - Simple)
- Session-based avec cookie httpOnly
- Username: `boo-team`
- Password: bcrypt hash de `BOO1304Cossonay!`
- NextAuth.js avec Credentials provider

### Authentification (Phase 2 - Infomaniak OAuth)
- OAuth 2.0 PKCE flow
- Tokens stockés en Redis
- Refresh tokens automatiques
- RBAC (Admin, Installer, Viewer)

### API Security
- CSRF protection (NextAuth)
- Rate limiting (Redis)
- Input validation (Zod)
- SQL injection protection (Prisma prepared statements)

### Network Security
- HTTPS only (Nginx Proxy Manager + Let's Encrypt)
- Tailscale VPN pour communication photomatons
- Docker network isolation
- Environment variables pour secrets

## Performance

### Caching Strategy
- **Redis Cache**:
  - Sessions utilisateurs (TTL: 30j)
  - Notion events (TTL: 5 min)
  - Photomaton status (TTL: 1 min)

- **Next.js Cache**:
  - Static pages: ISR (revalidate: 60s)
  - API routes: cache headers

### Database Optimization
- Index sur colonnes fréquemment requêtées:
  - `photomatons.hostname`
  - `events.notionPageId`
  - `photos.eventId + timestamp`
  - `speedTests.photomatonId + createdAt`

- Connection pooling (Prisma): 10 connections max

### Real-time Updates
- Socket.io avec fallback polling (5s)
- Rooms par photomaton pour broadcast ciblé
- Compression WebSocket activée

## Scalability

### Horizontal Scaling (Future)
- Multiple instances Next.js derrière load balancer
- Redis pour sessions partagées
- Socket.io avec Redis adapter (pub/sub)
- PostgreSQL read replicas

### Vertical Scaling
- Docker resource limits configurables
- PostgreSQL tuning (shared_buffers, work_mem)
- Redis maxmemory policy: allkeys-lru

## Monitoring & Observability

### Logging
- **Application**: Winston avec rotation
  - Niveaux: error, warn, info, debug
  - Format: JSON structuré
  - Sortie: stdout + fichier `/app/logs/`

- **Database**: PostgreSQL logs
- **Container**: Docker logs (stdout/stderr)

### Metrics (Future)
- Prometheus exporter
- Grafana dashboards:
  - Requêtes/sec
  - Latence API
  - Statut photomatons
  - Erreurs taux

### Health Checks
- `/api/health`: HTTP 200 si app OK
  - DB connection
  - Redis connection
  - Disk space

## Décisions Techniques Clés

### Pourquoi Next.js au lieu de PHP ?
1. **TypeScript**: Type-safety bout en bout
2. **Performance**: SSR, lazy loading, optimisations auto
3. **Écosystème**: npm packages modernes
4. **WebSocket intégré**: Socket.io natif
5. **Maintenance**: Code structure, meilleur DX

### Pourquoi PostgreSQL au lieu de MySQL ?
1. **JSONB**: Stockage efficace données Notion
2. **Robustesse**: ACID strict, meilleure concurrence
3. **Features avancées**: CTEs, window functions, full-text search
4. **Prisma support**: Meilleur support PostgreSQL

### Pourquoi Monorepo (app + agent) ?
1. **Types partagés**: TypeScript interfaces communes
2. **Versioning synchronisé**: 1 tag = 1 version complète
3. **CI/CD simplifié**: 1 workflow pour tout
4. **Documentation centralisée**

## Déploiement

### CI/CD Pipeline

```yaml
GitHub Push (main)
    ↓
GitHub Actions Trigger
    ↓
┌────────────────────┐
│ 1. Build Next.js   │
│ 2. Run tests       │
│ 3. Build Docker    │
│ 4. Push to ghcr.io │
└────────────────────┘
    ↓
Webhook Portainer
    ↓
┌────────────────────┐
│ 1. Pull image      │
│ 2. Stop old stack  │
│ 3. Start new stack │
│ 4. Health check    │
└────────────────────┘
    ↓
Production Live
```

### Rollback Strategy
1. Tag chaque release: `v1.0.0`, `v1.0.1`...
2. En cas d'erreur: pull image précédente dans Portainer
3. Redémarrer stack avec tag spécifique

### Backup Strategy
- **PostgreSQL**: pg_dump quotidien via cron
- **Volumes**: Acronis backup hôte
- **Code**: GitHub (source of truth)

## Phase Future (Roadmap)

### Phase 2: Agent Photomaton
- Service Windows Python
- SQLite local + sync intelligente
- Auto-découverte Tailscale

### Phase 3: OAuth Infomaniak
- Login SSO
- RBAC complet
- Session management avancé

### Phase 4: Features Avancées
- Pages installateurs (checklists)
- Export statistiques (CSV, Excel)
- Notifications push (Telegram, Email)
- Dashboard analytics avancé
- Multi-langage (FR/EN)

### Phase 5: Mobile App
- React Native app
- Contrôle photomatons mobile
- Push notifications temps réel
