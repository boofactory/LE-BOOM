# Guide Simple - Activer la Page Settings

## Étape 1: Redéployer le Stack (3 minutes)

1. **Va sur Portainer**: https://portainer.boofactory.ch
2. **Menu** → **Stacks** → Clique sur **`le-boom`**
3. **Scroll tout en bas** de la page
4. **Coche la case** "Pull and redeploy stack"
5. **Clique sur** le bouton bleu **"Update the stack"**
6. **Attends 30-60 secondes** que les containers redémarrent

✅ Les containers vont redémarrer avec la nouvelle image qui contient la page Settings!

---

## Étape 2: Résoudre la Migration Échouée (3 minutes)

### A. D'abord, réparer la base de données

1. **Menu** → **Containers**
2. **Clique sur** `boom-postgres`
3. **Clique sur** l'onglet **"Console"** (en haut)
4. **Dans "Command"**, sélectionne **/bin/sh**
5. **Clique sur** "Connect"
6. **Dans le terminal noir**, tape:

```bash
psql -U postgres -d boom_v2
```

7. **Ensuite, tape cette commande SQL** (copie-colle tout):

```sql
UPDATE "_prisma_migrations" SET finished_at = NOW(), applied_steps_count = 1, logs = NULL WHERE migration_name = '20251026000000_init' AND finished_at IS NULL;
```

8. **Appuie sur Entrée**
9. **Tape** `\q` pour quitter psql

✅ Tu devrais voir "UPDATE 1"

### B. Ensuite, appliquer les migrations

1. **Retourne sur Containers**
2. **Clique sur** `boom-webapp`
3. **Clique sur** l'onglet **"Console"**
4. **Dans "Command"**, sélectionne **/bin/sh**
5. **Clique sur** "Connect"
6. **Dans le terminal noir**, tape:

```bash
npx prisma migrate deploy
```

7. **Appuie sur Entrée**

✅ Tu devrais voir "No pending migrations to apply"

---

## Étape 3: Générer le Hash du Mot de Passe (1 minute)

**Toujours dans le même terminal** (console du container boom-webapp):

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('BooFactory2025!', 10).then(hash => console.log('HASH:', hash));"
```

**Appuie sur Entrée**

Tu vas voir quelque chose comme:
```
HASH: $2b$10$K8Ff3q3Z9vN5xJ6L4Y8wO.GZ5vK9xQ2wE3yR6tU7oP8sA1bC2dD3e
```

**📋 COPIE CE HASH** (tout ce qui est après "HASH: ")

---

## Étape 4: Mettre à Jour le Mot de Passe (2 minutes)

1. **Retourne sur** Portainer → Stacks → `le-boom`
2. **Clique sur** l'onglet **"Editor"**
3. **Scroll vers le bas** jusqu'à la section "Environment variables"
4. **Trouve la ligne** `ADMIN_PASSWORD_HASH`
5. **Remplace la valeur** par le hash que tu viens de copier
6. **Scroll tout en bas**
7. **Clique sur** "Update the stack"
8. **Attends ~30 secondes**

✅ Le mot de passe est maintenant correct!

---

## Étape 5: Se Connecter et Tester (1 minute)

1. **Va sur** https://boom-new.boofactory.ch/login
2. **Entre**:
   - Username: `boo-team`
   - Password: `BooFactory2025!`
3. **Clique sur** "Se connecter"

✅ Tu devrais être connecté!

---

## Étape 6: Aller sur la Page Settings

1. **Dans le menu en haut**, clique sur **"Paramètres"** (icône ⚙️)
2. **Tu vas voir** 3 champs:
   - NOTION_API_TOKEN (chiffré)
   - NOTION_DATABASE_ID
   - ADMIN_PASSWORD (chiffré)

✅ La page Settings fonctionne!

---

## Étape 7: Configurer Notion (2 minutes)

1. **Va sur** https://www.notion.so/my-integrations
2. **Crée une nouvelle intégration** ou copie un token existant
3. **Retourne sur** boom-new.boofactory.ch/dashboard/settings
4. **Colle le token** dans le champ "NOTION_API_TOKEN"
5. **Clique sur** "Enregistrer"

✅ Le token est maintenant configuré!

---

## Tester la Synchro Notion

1. **Clique sur** "Événements" (📅) dans le menu
2. **Clique sur** le bouton "Sync Notion"
3. **Vérifie** que les événements apparaissent

✅ Si ça marche, tout est OK!

---

## Résumé Temps Total: ~12 minutes

1. ✅ Redéployer stack (3 min)
2. ✅ Réparer migration échouée (3 min)
3. ✅ Générer hash (1 min)
4. ✅ Mettre à jour hash (2 min)
5. ✅ Se connecter (1 min)
6. ✅ Configurer Notion (2 min)

**Total**: ~12 minutes pour tout faire! 🎉

---

## En Cas de Problème

### "npx: command not found"
- Ferme et rouvre la console
- Ou redémarre le container boom-webapp

### "Cannot connect to database"
- Vérifie que boom-postgres est "running" dans Containers

### "Invalid credentials" après avoir mis à jour le hash
- Vérifie que tu as bien copié le hash complet (commence par `$2b$10$`)
- Vérifie qu'il n'y a pas d'espace avant ou après

### La page Settings ne s'affiche pas
- Vérifie que tu as bien exécuté la migration Prisma
- Vérifie les logs du container boom-webapp

---

**C'est parti! Commence par l'étape 1 sur Portainer** 🚀
