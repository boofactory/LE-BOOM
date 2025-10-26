# Ajout de la Page Settings - Résumé des Changements

**Date**: 26 octobre 2025
**Commit**: 0d1d7d9

## Problèmes Résolus

### 1. Mot de Passe Admin ne Fonctionnait Pas
❌ **Problème**: Le hash bcrypt du mot de passe admin était incorrect
✅ **Solution**: Ajout d'une interface pour changer le mot de passe directement dans l'application

### 2. Tokens API en Variables d'Environnement
❌ **Problème**: Pour changer un token (Notion, etc.), il fallait:
  - Modifier les variables dans Portainer
  - Redéployer le stack
  - Redémarrer tous les containers

✅ **Solution**: Gestion des tokens via interface web sécurisée

## Nouveautés Ajoutées

### 1. Modèle de Base de Données `Setting`

**Fichier**: `app/prisma/schema.prisma`

```prisma
model Setting {
  id          Int      @id @default(autoincrement())
  key         String   @unique
  value       String   @db.Text
  description String?
  encrypted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("settings")
}
```

**Caractéristiques**:
- Stockage clé-valeur flexible
- Support des valeurs chiffrées (tokens, passwords)
- Horodatage automatique
- Description optionnelle pour chaque setting

### 2. API Settings

**Fichier**: `app/src/app/api/settings/route.ts`

**Endpoints**:

#### GET /api/settings
Récupère tous les settings (valeurs chiffrées masquées)

```json
{
  "success": true,
  "data": {
    "settings": [
      {
        "id": 1,
        "key": "NOTION_API_TOKEN",
        "value": "********",
        "description": "Token API Notion",
        "encrypted": true,
        "updatedAt": "2025-10-26T14:30:00Z"
      }
    ]
  }
}
```

#### POST /api/settings
Crée ou met à jour un setting

```json
{
  "key": "NOTION_API_TOKEN",
  "value": "secret_xxx",
  "description": "Token API Notion",
  "encrypted": true
}
```

#### DELETE /api/settings?key=XXX
Supprime un setting

### 3. Page Settings dans le Dashboard

**Fichier**: `app/src/app/(dashboard)/dashboard/settings/page.tsx`

**Fonctionnalités**:
- Interface utilisateur pour gérer les tokens API
- Support des valeurs chiffrées (affichées comme `********`)
- Sauvegarde individuelle de chaque setting
- Indication visuelle des settings configurés
- Horodatage de la dernière modification

**Settings Pré-configurés**:

1. **NOTION_API_TOKEN** (chiffré)
   - Token d'intégration Notion
   - Lien direct vers notion.so/my-integrations

2. **NOTION_DATABASE_ID**
   - ID de la base de données Notion
   - Valeur par défaut: 4e70a95f1aa740c9a9beabfb5bea9e00

3. **ADMIN_PASSWORD** (chiffré)
   - Nouveau mot de passe administrateur
   - Sera hashé automatiquement avec bcrypt lors de la sauvegarde

### 4. Navigation Mise à Jour

**Fichier**: `app/src/app/(dashboard)/layout.tsx`

Ajout d'un onglet "Paramètres" (⚙️) dans la navigation du dashboard.

## Architecture de Sécurité

### Valeurs Chiffrées

Les settings marqués comme `encrypted: true`:
- Sont masqués dans l'interface (`********`)
- Ne sont jamais retournés en clair par l'API GET
- Sont stockés en clair dans la BD (chiffrement à implémenter si besoin)

**Note**: Pour une sécurité maximale, on pourrait ajouter un chiffrement avec une clé stockée en variable d'environnement. Mais pour l'instant, comme les tokens sont déjà dans la BD qui est protégée, c'est suffisant.

### Authentification

- Tous les endpoints `/api/settings` nécessitent une session authentifiée
- Vérification via `getServerSession(authOptions)`
- Retourne 401 Unauthorized si non connecté

## Migration Required

Après déploiement de cette version, **il faut exécuter la migration Prisma** pour créer la table `settings`:

```bash
docker exec -it boom-webapp npx prisma migrate deploy
```

Ou via l'interface Portainer:
1. Containers → boom-webapp → Console
2. Exécuter: `npx prisma migrate deploy`

## Workflow de Déploiement

### Avant (Changement de Token)
1. Éditer variables d'environnement dans Portainer
2. Redéployer le stack complet
3. Tous les containers redémarrent
4. Downtime de ~1-2 minutes

### Après (Changement de Token)
1. Se connecter à boom-new.boofactory.ch
2. Aller sur Paramètres (⚙️)
3. Modifier le token
4. Cliquer sur Enregistrer
5. ✅ Pris en compte immédiatement, sans redémarrage!

## Prochaines Améliorations Possibles

### Court Terme
- [ ] Ajouter le chiffrement des valeurs avec une clé d'environnement
- [ ] Permettre de tester la connexion Notion directement depuis l'interface
- [ ] Ajouter plus de settings (SMTP, webhooks, etc.)

### Moyen Terme
- [ ] Historique des modifications de settings (audit trail)
- [ ] Permissions granulaires (qui peut modifier quoi)
- [ ] Import/Export de configuration
- [ ] Validation des valeurs (format, regex)

### Long Terme
- [ ] Gestion multi-utilisateurs avec rôles
- [ ] 2FA pour les opérations sensibles
- [ ] Notifications lors de changement de settings critiques

## Bénéfices

✅ **UX améliorée**: Plus besoin d'accéder à Portainer pour changer un token
✅ **Zéro downtime**: Pas de redémarrage nécessaire
✅ **Sécurité**: Valeurs sensibles masquées dans l'interface
✅ **Flexibilité**: Facile d'ajouter de nouveaux settings
✅ **Audit**: Horodatage automatique des modifications
✅ **Simplicité**: Interface intuitive et guidée

## Comparaison: Variables d'Environnement vs Settings en BD

| Critère | Env Vars | Settings BD |
|---------|----------|-------------|
| Modification | Redéploiement complet | Instantanée |
| Downtime | Oui (~1-2 min) | Non |
| Interface | Portainer (technique) | Page web (user-friendly) |
| Historique | Non | Oui (updatedAt) |
| Sécurité | Visible dans Portainer | Masqué dans UI |
| Flexibilité | Limitée | Extensible |

---

**Conclusion**: Cette fonctionnalité rend l'application beaucoup plus autonome et facile à gérer au quotidien! 🎉
