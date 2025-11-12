# Guide de Déploiement - LE BOOM v2

## Prérequis

- Accès Portainer: https://portainer.boofactory.ch/
- Repository GitHub: `boofactory/LE-BOOM`
- Domaine configuré: `boom.boofactory.ch`
- Nginx Proxy Manager configuré
- Réseau Tailscale actif

---

## Déploiement Initial

### Étape 1: Configuration Portainer

1. **Connexion à Portainer**
   - URL: https://portainer.boofactory.ch/
   - Login avec compte admin

2. **Création de la Stack**
   - Aller dans **Stacks** → **+ Add stack**
   - Nom: `le-boom-prod`
   - Build method: **Git Repository**

3. **Configuration Git**
   - Repository URL: `https://github.com/boofactory/LE-BOOM`
   - Repository reference: `refs/heads/main`
   - Compose path: `app/docker-compose.prod.yml`
   - Authentication: Utiliser credentials GitHub (si repo privé)

4. **Variables d'Environnement**

Copier-coller ces variables dans l'onglet "Environment variables":

```env
# PostgreSQL
POSTGRES_DB=boom_v2
POSTGRES_USER=boom_admin
POSTGRES_PASSWORD=<générer mot de passe fort>

# Redis
REDIS_PASSWORD=<générer mot de passe fort>

# NextAuth
NEXTAUTH_URL=https://boom.boofactory.ch
NEXTAUTH_SECRET=<générer secret: openssl rand -base64 32>

# Auth Simple
ADMIN_USERNAME=boo-team
ADMIN_PASSWORD_HASH=$2b$10$... <bcrypt hash de BOO1304Cossonay!>

# Notion API
NOTION_API_TOKEN=<your_notion_api_token>
NOTION_DATABASE_ID=<your_notion_database_id>

# Application
NODE_ENV=production
LOG_LEVEL=info
ENABLE_ANALYTICS=false
NEXT_TELEMETRY_DISABLED=1

# Tailscale Photomatons (à adapter)
PHOTOMATON_1_IP=100.x.x.x
PHOTOMATON_1_HOSTNAME=photomaton-1
PHOTOMATON_1_ROUTER_IP=100.x.x.y
PHOTOMATON_2_IP=100.x.x.x
PHOTOMATON_2_HOSTNAME=photomaton-2
PHOTOMATON_2_ROUTER_IP=100.x.x.y
```

**Générer les secrets**:
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# POSTGRES_PASSWORD
openssl rand -base64 24

# REDIS_PASSWORD
openssl rand -base64 24

# ADMIN_PASSWORD_HASH (bcrypt de BOO1304Cossonay!)
# Utiliser: https://bcrypt-generator.com/ avec cost=10
```

5. **Déployer la Stack**
   - Cliquer sur **Deploy the stack**
   - Attendre que les 3 services démarrent (postgres, redis, boom-webapp)
   - Vérifier les logs de chaque container

---

### Étape 2: Configuration Nginx Proxy Manager

1. **Ajouter un Proxy Host**
   - Aller dans Nginx Proxy Manager: https://portainer.boofactory.ch:81
   - **Proxy Hosts** → **Add Proxy Host**

2. **Configuration du Host**
   - **Domain Names**: `boom.boofactory.ch`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `boom-webapp` (nom du container)
   - **Forward Port**: `3000`
   - Activer: **Websockets Support** ✓
   - Activer: **Block Common Exploits** ✓

3. **SSL Configuration**
   - Onglet **SSL**
   - SSL Certificate: **Request a new SSL Certificate**
   - Force SSL: ✓
   - HTTP/2 Support: ✓
   - HSTS Enabled: ✓
   - Email: `tech@boofactory.ch`
   - Accepter les Terms of Service

4. **Sauvegarder**

---

### Étape 3: Initialisation de la Base de Données

Les migrations Prisma sont exécutées automatiquement au démarrage du container via le Dockerfile.

**Vérification manuelle** (si besoin):

```bash
# Accéder au container
docker exec -it boom-webapp sh

# Vérifier l'état des migrations
npx prisma migrate status

# Appliquer manuellement (si nécessaire)
npx prisma migrate deploy
```

---

### Étape 4: Vérification du Déploiement

1. **Health Check**
   ```bash
   curl https://boom.boofactory.ch/api/health
   ```
   Doit retourner: `{"status":"healthy"}`

2. **Logs des Containers**
   - Portainer → Containers → boom-webapp → Logs
   - Vérifier qu'il n'y a pas d'erreurs

3. **Test de Connexion**
   - Ouvrir: https://boom.boofactory.ch
   - Login avec: `boo-team` / `BOO1304Cossonay!`
   - Vérifier que le dashboard charge

---

## Mises à Jour

### Méthode 1: Pull Manuel (Portainer)

1. Aller dans **Stacks** → `le-boom-prod`
2. Cliquer sur **Pull and redeploy**
3. Portainer va:
   - Pull la dernière version depuis GitHub
   - Rebuild les images
   - Redémarrer les services

**Temps d'arrêt**: ~30-60 secondes

### Méthode 2: Via API Portainer (Automatisé)

**IMPORTANT**: Utiliser la commande suivante avec le bon format de body JSON:

```bash
# Stack ID: 71
# Endpoint ID: 3
curl -X PUT "https://portainer.boofactory.ch/api/stacks/71/git/redeploy?endpointId=3" \
  -H "X-API-Key: ptr_zBlD+aR7Dveqdv6EP6YKqq5PRfZPe9hrHrWQ/nqdeY8=" \
  -H "Content-Type: application/json" \
  -d '{"repositoryReferenceName":"","repositoryAuthentication":false,"pullImage":true,"prune":false}'
```

**Paramètres importants**:
- `repositoryReferenceName`: "" (vide = utilise la branche configurée dans la stack)
- `repositoryAuthentication`: false (pas besoin d'auth pour repo public)
- `pullImage`: true (force le pull de la nouvelle image Docker)
- `prune`: false (ne supprime pas les volumes)

Ou via GitHub Actions (workflow déjà configuré dans `.github/workflows/deploy.yml`).

### Méthode 3: Watchtower (Auto-update)

Le container Watchtower (déjà présent sur ton Portainer) surveille les images et redémarre automatiquement si une nouvelle version est disponible sur ghcr.io.

**Activer pour LE BOOM**:
```yaml
# Ajouter dans docker-compose.prod.yml
labels:
  - "com.centurylinklabs.watchtower.enable=true"
```

---

## Rollback

### En cas de problème après déploiement

1. **Revenir à une version précédente**
   - Aller dans **Stacks** → `le-boom-prod` → **Editor**
   - Modifier l'image dans docker-compose:
     ```yaml
     boom-webapp:
       image: ghcr.io/boofactory/le-boom:v1.0.0  # spécifier version
     ```
   - Cliquer sur **Update the stack**

2. **Via CLI** (si accès SSH)
   ```bash
   cd /data/compose/<stack-id>
   docker-compose pull
   docker-compose up -d
   ```

---

## Backups

### Base de Données PostgreSQL

**Backup automatique quotidien** (cron sur l'hôte):

```bash
# Créer script backup
sudo nano /opt/scripts/backup-boom-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/boom"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="boom-postgres"

mkdir -p $BACKUP_DIR

docker exec $CONTAINER pg_dump -U boom_admin boom_v2 | gzip > $BACKUP_DIR/boom_db_$DATE.sql.gz

# Garder seulement les 30 derniers jours
find $BACKUP_DIR -name "boom_db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: boom_db_$DATE.sql.gz"
```

**Ajouter au crontab**:
```bash
sudo chmod +x /opt/scripts/backup-boom-db.sh
sudo crontab -e
# Ajouter:
0 3 * * * /opt/scripts/backup-boom-db.sh
```

### Restauration depuis Backup

```bash
# Copier le backup dans le container
docker cp boom_db_20251026.sql.gz boom-postgres:/tmp/

# Restaurer
docker exec -it boom-postgres bash
cd /tmp
gunzip boom_db_20251026.sql.gz
psql -U boom_admin -d boom_v2 < boom_db_20251026.sql
```

### Volumes Docker

Les volumes sont déjà backupés via **Acronis** sur l'hôte Portainer:
- `le-boom-prod_postgres_data`
- `le-boom-prod_redis_data`
- `le-boom-prod_uploads_data`
- `le-boom-prod_logs_data`

---

## Monitoring

### Logs

**Accéder aux logs en temps réel**:
```bash
# Via Portainer Web UI
Containers → boom-webapp → Logs

# Via CLI
docker logs -f boom-webapp
docker logs -f boom-postgres
docker logs -f boom-redis
```

**Filtrer les erreurs**:
```bash
docker logs boom-webapp 2>&1 | grep ERROR
```

### Métriques Container

Utiliser **Beszel** (déjà configuré sur ton Portainer):
- URL: https://beszel.boofactory.ch/
- Monitorer CPU, RAM, Disk I/O des containers

### Health Checks

**Vérification automatique** (toutes les 30s):
```bash
# Configuré dans docker-compose.prod.yml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:3000/api/health"]
```

**Vérifier l'état**:
```bash
docker ps | grep boom-webapp
# Doit afficher: (healthy)
```

---

## Troubleshooting

### Container ne démarre pas

1. **Vérifier les logs**:
   ```bash
   docker logs boom-webapp
   ```

2. **Erreurs courantes**:
   - **Database connection failed**: Vérifier `DATABASE_URL` et que postgres est démarré
   - **Redis connection failed**: Vérifier `REDIS_URL` et password
   - **Port already in use**: Changer le port dans docker-compose

### Migration Prisma échoue

```bash
# Accéder au container
docker exec -it boom-webapp sh

# Reset database (ATTENTION: perte de données!)
npx prisma migrate reset

# Forcer la migration
npx prisma migrate deploy --force
```

### Application lente

1. **Vérifier les ressources**:
   ```bash
   docker stats boom-webapp
   ```

2. **Augmenter les limites** (dans docker-compose):
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '4'
         memory: 4G
   ```

3. **Optimiser PostgreSQL**:
   ```sql
   -- Analyser les requêtes lentes
   SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;
   ```

### WebSocket ne fonctionne pas

1. **Vérifier Nginx Proxy Manager**:
   - Websockets Support doit être activé ✓

2. **Tester la connexion**:
   ```javascript
   // Dans la console navigateur
   const socket = io('https://boom.boofactory.ch');
   socket.on('connect', () => console.log('Connected!'));
   ```

---

## Sécurité

### Mise à jour des Secrets

**Changer NEXTAUTH_SECRET**:
```bash
# Générer nouveau secret
openssl rand -base64 32

# Mettre à jour dans Portainer
Stacks → le-boom-prod → Editor → Environment variables
```

**Rotation des mots de passe DB**:
```bash
# 1. Générer nouveau password
NEW_PASS=$(openssl rand -base64 24)

# 2. Changer dans PostgreSQL
docker exec -it boom-postgres psql -U postgres
ALTER USER boom_admin WITH PASSWORD '<new_pass>';

# 3. Mettre à jour DATABASE_URL dans Portainer
# 4. Redémarrer boom-webapp
```

### Firewall

Vérifier que seuls les ports nécessaires sont ouverts:
- `80/tcp` (HTTP → redirect HTTPS)
- `443/tcp` (HTTPS)
- `9443/tcp` (Portainer)

Tailscale gère le reste via VPN.

---

## Maintenance

### Nettoyage Docker

**Supprimer les images inutilisées**:
```bash
docker system prune -a --volumes
# ATTENTION: Ne pas exécuter si d'autres stacks utilisent les mêmes images
```

**Nettoyer les logs**:
```bash
# Limiter la taille des logs Docker (dans /etc/docker/daemon.json)
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Mises à jour de Sécurité

**Images de base** (PostgreSQL, Redis):
- Watchtower les met à jour automatiquement
- Ou manuellement: `docker-compose pull && docker-compose up -d`

**Dépendances Node.js**:
- Via Dependabot (GitHub) pour les PRs automatiques
- Ou manuellement: `npm update` puis rebuild image

---

## Contact & Support

- **Documentation**: [docs/](../docs/)
- **Issues GitHub**: https://github.com/boofactory/LE-BOOM/issues
- **Admin Portainer**: tech@boofactory.ch
