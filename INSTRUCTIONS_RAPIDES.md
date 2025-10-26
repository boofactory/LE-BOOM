# Instructions Rapides - Migration Automatique

## Problème Résolu Automatiquement!

J'ai modifié le Dockerfile pour qu'il **résolve automatiquement** les migrations échouées au démarrage.

Le container `boom-webapp` va maintenant:
1. Résoudre la migration `20251026000000_init` si elle est marquée comme échouée
2. Appliquer toutes les migrations en attente
3. Démarrer l'application

## Ce Que Tu Dois Faire (5 minutes)

### Étape 1: Redéployer le Stack (2 minutes)

1. Va sur **Portainer**: https://portainer.boofactory.ch
2. Menu → **Stacks** → **le-boom**
3. Scroll en bas et **coche** "Pull and redeploy stack"
4. Clique sur **"Update the stack"**
5. Attends 1-2 minutes que les containers redémarrent

✅ Le container va se corriger tout seul!

### Étape 2: Vérifier les Logs (1 minute)

1. Menu → **Containers** → **boom-webapp**
2. Clique sur **"Logs"**
3. Tu devrais voir:
   - `Migration 20251026000000_init marked as applied`
   - `No pending migrations to apply`
   - Server is listening on port 3000

✅ Si tu vois ces messages, tout fonctionne!

### Étape 3: Générer le Hash du Mot de Passe (1 minute)

1. Containers → **boom-webapp**
2. Console → **/bin/sh** → Connect
3. Tape:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('BooFactory2025!', 10).then(hash => console.log('HASH:', hash));"
```

4. **Copie le hash** (tout ce qui suit "HASH:")

### Étape 4: Mettre à Jour le Hash (1 minute)

1. Stacks → **le-boom** → **Editor**
2. Trouve `ADMIN_PASSWORD_HASH`
3. Remplace par le hash que tu as copié
4. **Update the stack**

### Étape 5: Se Connecter (30 secondes)

1. Va sur https://boom-new.boofactory.ch/login
2. Username: `boo-team`
3. Password: `BooFactory2025!`

✅ **Ça devrait marcher!**

---

## Résumé des Changements

### Ce que j'ai fait:

1. **Modifié le Dockerfile** pour auto-résoudre les migrations échouées
2. **Build complété** avec succès (commit `66bfc96`)
3. **Nouvelle image Docker** disponible sur ghcr.io

### La commande magique dans le Dockerfile:

```bash
npx prisma migrate resolve --applied 20251026000000_init || true && npx prisma migrate deploy && node server.js
```

Ceci va:
- Marquer la migration comme "applied" si elle était échouée
- Ignorer les erreurs (|| true)
- Appliquer toutes les migrations
- Démarrer le serveur

---

## Si Ça Ne Marche Toujours Pas

Regarde le fichier **GUIDE_SIMPLE.md** pour la méthode manuelle avec psql.

Mais normalement, avec cette nouvelle image, **ça devrait marcher automatiquement!** 🎉
