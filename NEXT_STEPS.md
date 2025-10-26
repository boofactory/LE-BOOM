# Prochaines Étapes - Après le Build

## 1. Attendre le Build GitHub Actions

Le build est en cours. Une fois terminé, l'image `ghcr.io/boofactory/le-boom:main` sera mise à jour.

## 2. Mettre à Jour le Stack Portainer

### Option A: Via l'interface Portainer

1. Aller sur https://portainer.boofactory.ch
2. Stacks → `le-boom`
3. Cliquer sur "Pull and redeploy"
4. Attendre que les containers redémarrent

### Option B: Via API

```bash
curl -X POST "https://portainer.boofactory.ch/api/stacks/69/git/redeploy?endpointId=3&pullImage=true" \
  -H "X-API-Key: ptr_8lig2q3X9BhaQbaCuJoA/f2dXqjSC6rrpNWGYrB1nrI="
```

## 3. Exécuter la Migration Prisma

Une fois les containers redémarrés, il faut créer la nouvelle table `settings`:

```bash
# Se connecter au container
curl -X POST "https://portainer.boofactory.ch/api/endpoints/3/docker/containers/boom-webapp/exec" \
  -H "X-API-Key: ptr_8lig2q3X9BhaQbaCuJoA/f2dXqjSC6rrpNWGYrB1nrI=" \
  -H "Content-Type: application/json" \
  -d '{
    "AttachStdout": true,
    "AttachStderr": true,
    "Cmd": ["npx", "prisma", "migrate", "deploy"]
  }'
```

Ou via exec direct:

```bash
docker exec -it boom-webapp npx prisma migrate deploy
```

## 4. Accéder à la Page Settings

1. Aller sur https://boom-new.boofactory.ch/login
2. Se connecter (pour l'instant, le mot de passe ne fonctionne peut-être pas)
3. **SOLUTION TEMPORAIRE**: Mettre à jour manuellement le hash dans Portainer

## 5. Corriger le Mot de Passe Admin (Solution Temporaire)

Comme le mot de passe ne fonctionne pas, voici comment le corriger:

### Générer le bon hash:

```bash
docker exec -it boom-webapp node -e "const bcrypt = require('bcrypt'); bcrypt.hash('BooFactory2025!', 10).then(hash => console.log(hash));"
```

### Mettre à jour dans Portainer:

1. Copier le hash généré
2. Aller dans Portainer → Stacks → le-boom → Editor
3. Dans les variables d'environnement, mettre à jour `ADMIN_PASSWORD_HASH` avec le nouveau hash
4. Sauvegarder et redéployer

## 6. Tester la Connexion

Une fois le mot de passe corrigé:

1. Aller sur https://boom-new.boofactory.ch/login
2. Username: `boo-team`
3. Password: `BooFactory2025!`
4. Après connexion, aller sur Paramètres (⚙️)

## 7. Configurer les Tokens API via l'Interface

Dans la page Paramètres:

### NOTION_API_TOKEN
- Obtenir sur https://www.notion.so/my-integrations
- Créer une nouvelle intégration
- Copier le token
- Le coller dans le champ "NOTION_API_TOKEN"
- Cliquer sur "Enregistrer"

### NOTION_DATABASE_ID
- Déjà configuré: `4e70a95f1aa740c9a9beabfb5bea9e00`
- Vérifier/modifier si nécessaire

### ADMIN_PASSWORD (Nouveau mot de passe)
- Pour changer ton mot de passe admin
- Entrer le nouveau mot de passe
- Il sera automatiquement hashé avec bcrypt
- Cliquer sur "Enregistrer"

## 8. Synchroniser Notion

Une fois les tokens configurés:

1. Aller sur la page "Événements"
2. Cliquer sur le bouton "Sync Notion"
3. Vérifier que les événements s'affichent

## 9. Tester les Photomatons

1. Aller sur la page "Photomatons"
2. Vérifier que Boo1 et Boo2 apparaissent
3. Tester les actions (Power On/Off, Lock/Unlock)

## Résumé des Avantages de la Nouvelle Approche

✅ **Plus besoin de modifier les variables d'environnement dans Portainer**
✅ **Gestion des tokens via interface web sécurisée**
✅ **Changement de mot de passe admin sans redéploiement**
✅ **Valeurs chiffrées stockées en base de données**
✅ **Historique des modifications (updatedAt)**

---

**Note**: Cette approche est beaucoup plus pratique et sécurisée que de gérer les tokens dans les variables d'environnement!
