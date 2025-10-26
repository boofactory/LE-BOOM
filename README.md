# LE BOOM v2

Application de gestion et monitoring des photomatons BooFactory avec intégration Notion.

## Vue d'ensemble

LE BOOM est une application web full-stack pour:
- Visualiser les événements à venir (intégration Notion)
- Gérer et contrôler les photomatons à distance (via Tailscale)
- Monitorer l'état des équipements (connexion, papier, statistiques)
- Analyser les statistiques d'utilisation
- Historique des événements et photos

## Stack Technologique

- **Frontend**: Next.js 14 (App Router) + React + Tailwind CSS
- **Backend**: Next.js API Routes + Socket.io
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **ORM**: Prisma
- **Containerisation**: Docker + Docker Compose
- **CI/CD**: GitHub Actions → ghcr.io
- **Réseau**: Tailscale (VPN mesh)

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Notion    │─────▶│  LE BOOM App │◀────▶│ PostgreSQL  │
│  Database   │      │  (Next.js)   │      │   + Redis   │
└─────────────┘      └──────┬───────┘      └─────────────┘
                            │
                    ┌───────┴────────┐
                    │   Tailscale    │
                    │      VPN       │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
  ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
  │Photomaton │      │Photomaton │      │  Routeur  │
  │  PC + IP  │      │  PC + IP  │      │ Teltonika │
  └───────────┘      └───────────┘      └───────────┘
```

## Quick Start

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- Accès Tailscale configuré
- Accès à Portainer

### Installation Locale

```bash
# Cloner le repo
git clone https://github.com/boofactory/LE-BOOM.git
cd LE-BOOM/app

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos credentials

# Initialiser la base de données
npx prisma generate
npx prisma migrate dev

# Lancer en dev
npm run dev
```

Application accessible sur http://localhost:3000

### Déploiement Production (Portainer)

Voir [DEPLOYMENT.md](docs/DEPLOYMENT.md) pour les instructions complètes.

**Résumé**:
1. Configurer les variables d'environnement dans Portainer
2. Créer une stack depuis GitConfig pointant vers ce repo
3. File path: `app/docker-compose.prod.yml`
4. Démarrer la stack

## Variables d'Environnement

### Base de données
```env
DATABASE_URL=postgresql://user:password@postgres:5432/boom_v2
POSTGRES_USER=boom_admin
POSTGRES_PASSWORD=<généré>
POSTGRES_DB=boom_v2
```

### Cache Redis
```env
REDIS_URL=redis://:password@redis:6379
REDIS_PASSWORD=<généré>
```

### Authentication
```env
NEXTAUTH_URL=https://boom.boofactory.ch
NEXTAUTH_SECRET=<généré>
ADMIN_USERNAME=boo-team
ADMIN_PASSWORD_HASH=<bcrypt>
```

### Notion API
```env
NOTION_API_TOKEN=ntn_...
NOTION_DATABASE_ID=17fbfebc2f7e8072a8f2fef71603db25
```

### Application
```env
NODE_ENV=production
LOG_LEVEL=info
ENABLE_ANALYTICS=false
NEXT_TELEMETRY_DISABLED=1
```

### Tailscale Photomatons
```env
PHOTOMATON_1_IP=100.x.x.x
PHOTOMATON_1_HOSTNAME=photomaton-1
PHOTOMATON_2_IP=100.x.x.x
PHOTOMATON_2_HOSTNAME=photomaton-2
```

## Structure du Projet

```
LE-BOOM/
├── app/                          # Application Next.js
│   ├── src/
│   │   ├── app/                  # App Router (pages + API)
│   │   │   ├── api/              # Backend API endpoints
│   │   │   ├── (dashboard)/      # Pages dashboard
│   │   │   ├── login/            # Page d'authentification
│   │   │   └── layout.tsx        # Layout principal
│   │   ├── components/           # Composants React réutilisables
│   │   ├── lib/                  # Utilitaires & clients (Notion, DB)
│   │   └── types/                # Types TypeScript
│   ├── prisma/                   # Schema Prisma + migrations
│   ├── public/                   # Assets statiques
│   ├── docker-compose.prod.yml   # Config Docker production
│   ├── Dockerfile                # Image multi-stage
│   ├── package.json
│   └── tsconfig.json
├── agent/                        # Agent Python photomatons (Phase 2)
│   ├── boom_agent/
│   ├── setup.py
│   └── README.md
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── AGENT.md
├── .github/
│   └── workflows/
│       └── docker-build.yml      # CI/CD GitHub Actions
└── README.md
```

## Fonctionnalités Principales

### Dashboard Notion
- Affichage des événements "En cours"
- Tuiles avec informations clés
- Modal détails événement
- Synchronisation automatique

### Gestion Photomatons
- État en temps réel (router, PC)
- Contrôles:
  - Power On/Off (Wake-on-LAN)
  - Lock/Unlock screen
  - Test impression
- Monitoring papier restant avec seuils configurables
- Speedtest historique

### Statistiques
- Vue globale (moyennes, records)
- Par événement (photos, prints, GIFs)
- Timeline photos
- Export données (future)

### Historique
- Liste événements passés
- Détails par photomaton
- Suppression avec confirmation

## Développement

### Commandes Utiles

```bash
# Dev local
npm run dev

# Build production
npm run build
npm start

# Prisma
npx prisma studio          # Interface DB
npx prisma migrate dev     # Créer migration
npx prisma generate        # Générer client

# Linting
npm run lint
npm run lint:fix

# Tests (future)
npm test
```

### Architecture Backend

**API Routes** (`app/src/app/api/`):
- `/api/photomatons` - CRUD photomatons
- `/api/events` - Stats & historique
- `/api/notion/sync` - Pull événements Notion
- `/api/webhooks/action` - Trigger actions photomatons
- `/api/agent/sync` - Sync données agent (POST from photomatons)
- `/api/health` - Health check

**WebSocket** (`/api/socket`):
- Real-time updates statuts photomatons
- Push notifications

### Contribution

1. Créer une branche feature: `git checkout -b feature/ma-feature`
2. Commit: `git commit -m "feat: description"`
3. Push: `git push origin feature/ma-feature`
4. Créer une Pull Request

**Convention commits**: [Conventional Commits](https://www.conventionalcommits.org/)

## Support & Contact

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Team**: BooFactory

## License

Propriétaire - BooFactory © 2025
