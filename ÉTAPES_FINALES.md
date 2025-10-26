# Étapes Finales pour Activer la Page Settings

## Statut Actuel

✅ Build GitHub Actions: **RÉUSSI**
✅ Nouvelle image disponible: `ghcr.io/boofactory/le-boom:main`
✅ Code Settings prêt et fonctionnel

⏳ À faire: Mettre à jour et redéployer sur Portainer

---

## Étape 1: Mettre à Jour le Stack Portainer

### Option A: Via l'Interface Web (Recommandé)

1. **Aller sur Portainer**
   - URL: https://portainer.boofactory.ch
   - Se connecter

2. **Accéder au stack**
   - Menu: Stacks
   - Cliquer sur `le-boom`

3. **Redéployer avec la nouvelle image**
   - Scroller en bas
   - Cocher "Pull latest image version"
   - Cliquer sur "Update the stack"
   - Attendre ~30 secondes

### Option B: Via la Console

Si tu as accès SSH au serveur:

```bash
cd /data/compose/69  # Dossier du stack
docker-compose pull  # Pull les nouvelles images
docker-compose up -d # Redémarre avec les nouvelles images
```

---

## Étape 2: Exécuter la Migration Prisma

Une fois le container redémarré, il faut créer la table `settings`:

### Via Portainer Console (Recommandé)

1. Menu: Containers
2. Cliquer sur `boom-webapp`
3. Cliquer sur "Console"
4. Sélectionner "/bin/sh"
5. Cliquer sur "Connect"
6. Dans le terminal, exécuter:

```bash
npx prisma migrate deploy
```

### Via SSH (Alternative)

```bash
docker exec -it boom-webapp npx prisma migrate deploy
```

**Résultat attendu**:
```
Applying migration `20251026_add_settings_table`
✔ Applied migrations:
  └─ 20251026_add_settings_table
```

---

## Étape 3: Tester l'Accès à la Page Settings

1. **Aller sur l'application**
   - URL: https://boom-new.boofactory.ch

2. **Se connecter** (même si le mot de passe ne marche pas encore)
   - Username: `boo-team`
   - Password: `BooFactory2025!`

3. **Si la connexion échoue**:
   - Pas grave, on va le corriger via Settings justement!
   - Il faut d'abord générer le bon hash

---

## Étape 4: Corriger le Mot de Passe Admin

### A. Générer le Hash Bcrypt Correct

Dans le container boom-webapp (via Console Portainer):

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('BooFactory2025!', 10).then(hash => console.log('HASH:', hash));"
```

**Copier le hash** qui s'affiche (commence par `$2b$10$...`)

### B. Mettre à Jour dans Portainer

1. Portainer → Stacks → `le-boom` → Editor
2. Trouver la variable `ADMIN_PASSWORD_HASH`
3. Remplacer la valeur par le hash copié
4. Cliquer sur "Update the stack"
5. Attendre que le container redémarre

### C. Tester la Connexion

1. Retourner sur https://boom-new.boofactory.ch/login
2. Username: `boo-team`
3. Password: `BooFactory2025!`
4. ✅ Ça devrait fonctionner maintenant!

---

## Étape 5: Utiliser la Page Settings

Une fois connecté:

1. **Cliquer sur "Paramètres" (⚙️)** dans le menu du dashboard

2. **Configurer le Token Notion**
   - Aller sur https://www.notion.so/my-integrations
   - Créer une intégration ou copier un token existant
   - Coller le token dans le champ "NOTION_API_TOKEN"
   - Cliquer sur "Enregistrer"

3. **Vérifier NOTION_DATABASE_ID**
   - Devrait être déjà configuré: `4e70a95f1aa740c9a9beabfb5bea9e00`
   - Modifier si nécessaire

4. **Changer le Mot de Passe Admin** (Optionnel)
   - Entrer un nouveau mot de passe dans "ADMIN_PASSWORD"
   - Cliquer sur "Enregistrer"
   - Le mot de passe sera automatiquement hashé avec bcrypt
   - À la prochaine connexion, utiliser ce nouveau mot de passe

---

## Étape 6: Tester Notion Sync

1. **Aller sur la page "Événements"** (📅)
2. **Cliquer sur "Sync Notion"**
3. **Vérifier** que les événements s'affichent

Si ça ne marche pas:
- Vérifier que le token Notion est correct
- Vérifier que l'intégration Notion a accès à la database
- Checker les logs du container: Portainer → Containers → boom-webapp → Logs

---

## Étape 7: Tester les Photomatons

1. **Aller sur "Photomatons"** (📸)
2. **Vérifier** que Boo1 et Boo2 apparaissent
3. **Tester une action** (par exemple: Lock/Unlock)

---

## Résumé Rapide

```bash
# 1. Redéployer le stack Portainer (via UI)
# 2. Migrer la base de données
docker exec -it boom-webapp npx prisma migrate deploy

# 3. Générer le hash du mot de passe
docker exec -it boom-webapp node -e "const bcrypt = require('bcrypt'); bcrypt.hash('BooFactory2025!', 10).then(hash => console.log('HASH:', hash));"

# 4. Mettre à jour ADMIN_PASSWORD_HASH dans Portainer (via UI)
# 5. Se connecter et aller sur Settings (⚙️)
# 6. Configurer les tokens Notion
# 7. Profiter! 🎉
```

---

## Dépannage

### "Failed to fetch settings"
- La migration Prisma n'a pas été exécutée
- Solution: Étape 2

### "Cannot connect to database"
- PostgreSQL n'est pas démarré
- Vérifier: Portainer → Containers → boom-postgres
- Vérifier les logs

### "Invalid credentials"
- Le hash du mot de passe est incorrect
- Solution: Étape 4

### "Notion sync failed"
- Token Notion invalide ou expiré
- L'intégration n'a pas accès à la database
- Vérifier les permissions dans Notion

---

**Note**: Après avoir configuré les tokens via l'UI Settings, tu n'auras plus jamais besoin de toucher aux variables d'environnement dans Portainer pour changer un token! 🎉
