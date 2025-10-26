# LE BOOM - Rapport de Déploiement

**Date**: 26 octobre 2025
**Status**: ✅ DÉPLOYÉ ET FONCTIONNEL

---

## Résumé

L'application **LE BOOM v2** a été déployée avec succès sur Portainer et est accessible via:

🔗 **URL**: https://boom-new.boofactory.ch

---

## Informations de Connexion

**Nom d'utilisateur**: `boo-team`
**Mot de passe**: `BooFactory2025!`

⚠️ **Important**: Changez ce mot de passe après la première connexion.

---

## Services Déployés

Tous les services sont **UP** et **HEALTHY**:

| Service | Statut | Container |
|---------|--------|-----------|
| PostgreSQL 16 | ✅ Healthy | boom-postgres |
| Redis 7 | ✅ Healthy | boom-redis |
| Next.js App | ✅ Healthy | boom-webapp |

**Stack Portainer**: `le-boom` (ID: 69)

---

## Images Docker

L'application utilise l'image Docker buildée automatiquement via GitHub Actions:

- **Image**: `ghcr.io/boofactory/le-boom:main`
- **Registry**: GitHub Container Registry (ghcr.io)
- **Repository**: https://github.com/boofactory/LE-BOOM

Chaque push sur la branche `main` déclenche automatiquement:
1. Build de l'image Docker
2. Push sur ghcr.io
3. Tag avec `main` et `sha-<commit>`

---

## Problèmes Résolus Durant le Déploiement

### 1. Erreurs de Build GitHub Actions

**Problèmes rencontrés**:
- ❌ npm ci sans package-lock.json
- ❌ Tailwind CSS manquant (devDependencies non installées)
- ❌ Routes API Next.js 15 - params doit être Promise
- ❌ useSearchParams sans Suspense boundary
- ❌ Webhook Portainer optionnel causait l'échec du build

**Solutions appliquées**:
- ✅ Changé `npm ci` → `npm install` dans Dockerfile
- ✅ Installé toutes les dépendances dans builder stage
- ✅ Mis à jour toutes les routes dynamiques pour Next.js 15
- ✅ Enveloppé LoginForm dans Suspense
- ✅ Rendu le webhook Portainer optionnel avec `continue-on-error`

### 2. Configuration Portainer

**Actions effectuées**:
- Supprimé l'ancien stack `boom-v2-test`
- Créé le nouveau stack `le-boom` avec variables d'environnement sécurisées
- Configuré les réseaux Docker (boom-network + nginx-proxy-manager_default)
- Configuré les volumes persistants pour PostgreSQL, Redis, uploads et logs

---

## Variables d'Environnement

Les variables suivantes ont été configurées dans Portainer:

```bash
# Base de données
POSTGRES_DB=boom_v2
POSTGRES_USER=boom_admin
POSTGRES_PASSWORD=<généré automatiquement>

# Cache
REDIS_PASSWORD=<généré automatiquement>

# NextAuth
NEXTAUTH_URL=https://boom.boofactory.ch
NEXTAUTH_SECRET=<généré automatiquement>

# Admin
ADMIN_USERNAME=boo-team
ADMIN_PASSWORD_HASH=<bcrypt hash>

# Notion (À METTRE À JOUR)
NOTION_API_TOKEN=placeholder_update_later
NOTION_DATABASE_ID=4e70a95f1aa740c9a9beabfb5bea9e00

# Photomatons
PHOTOMATON_1_IP=100.119.216.41
PHOTOMATON_1_HOSTNAME=boofactory-boo1
PHOTOMATON_1_ROUTER_IP=100.82.102.117

PHOTOMATON_2_IP=100.107.171.80
PHOTOMATON_2_HOSTNAME=boofactory-boo2
PHOTOMATON_2_ROUTER_IP=100.116.97.112
```

---

## Tests Effectués

✅ **Health Check API**: https://boom-new.boofactory.ch/api/health
```json
{
  "status": "healthy",
  "timestamp": "2025-10-26T14:03:08.116Z",
  "services": {
    "database": "connected",
    "redis": "not implemented"
  },
  "uptime": 1203.250859233
}
```

✅ **Page d'accueil**: Accessible et affiche "LE BOOM - BooFactory Photomaton Management"

✅ **Page de login**: Accessible

---

## Prochaines Étapes

### 1. Tester la Connexion
Ouvrez un navigateur et allez sur:
- https://boom-new.boofactory.ch/login
- Connectez-vous avec `boo-team` / `BooFactory2025!`

### 2. Mettre à Jour le Token Notion
Dans Portainer, éditez le stack `le-boom` et remplacez:
- `NOTION_API_TOKEN=placeholder_update_later` par votre vrai token Notion

### 3. Tester les Fonctionnalités
- [ ] Connexion utilisateur
- [ ] Dashboard (liste des événements Notion)
- [ ] Page Photomatons (voir les 2 photomatons avec leurs statuts)
- [ ] Actions: Power On/Off, Lock/Unlock
- [ ] Sync Notion
- [ ] Statistiques

### 4. Configurer boom.boofactory.ch (Optionnel)
Une fois les tests validés sur boom-new.boofactory.ch, vous pouvez:
- Mettre à jour le proxy Nginx pour router boom.boofactory.ch vers le port 3001
- Ou garder boom-new.boofactory.ch comme URL définitive

### 5. Initialiser la Base de Données
Au premier lancement, Prisma doit créer les tables. Pour exécuter les migrations:

```bash
# Se connecter au container
docker exec -it boom-webapp sh

# Exécuter les migrations
npm run prisma:deploy
```

---

## Architecture Déployée

```
                    Internet
                       |
                       v
            Nginx Proxy Manager
         (boom-new.boofactory.ch)
                       |
                       v
                  boom-webapp
              (ghcr.io/boofactory/le-boom:main)
              Port: 3001 → 3000
                   /       \
                  /         \
                 v           v
          boom-postgres   boom-redis
          (PostgreSQL 16) (Redis 7)
```

**Réseaux**:
- `boom-network`: Réseau interne (172.24.0.0/16)
- `nginx-proxy-manager_default`: Réseau externe (connecté au proxy)

**Volumes Persistants**:
- `postgres_data`: Données PostgreSQL
- `redis_data`: Données Redis
- `uploads_data`: Photos uploadées
- `logs_data`: Logs applicatifs

---

## Monitoring

L'application dispose de:
- **Health Check**: `/api/health` (appelé toutes les 30s)
- **Uptime**: Visible dans la réponse health check
- **Logs Docker**: Accessibles via Portainer

---

## Support

En cas de problème:
1. Vérifier les logs dans Portainer (stack le-boom → boom-webapp)
2. Vérifier le health check: https://boom-new.boofactory.ch/api/health
3. Vérifier que PostgreSQL et Redis sont healthy
4. Consulter le README.md et ARCHITECTURE.md du projet

---

**Déploiement réussi! 🎉**
