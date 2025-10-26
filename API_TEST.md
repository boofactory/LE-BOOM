# API de Test - LE BOOM v2

Cette API permet d'exécuter des tests automatisés sur toutes les fonctionnalités de l'application.

## Configuration

### 1. Générer une API Key

```bash
curl https://boom-new.boofactory.ch/api/test/auth
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "apiKey": "a1b2c3d4e5f6...",
    "message": "Save this API key in your TEST_API_KEY environment variable",
    "instructions": [
      "1. Add TEST_API_KEY to your Portainer stack environment variables",
      "2. Restart the stack",
      "3. Use this key to authenticate test API calls"
    ]
  }
}
```

### 2. Configurer dans Portainer

1. **Portainer** → **Stacks** → **le-boom**
2. **Environment variables** → Ajouter:
   ```
   TEST_API_KEY=a1b2c3d4e5f6... (la clé générée)
   ```
3. **Update the stack**

## Endpoints Disponibles

### 1. Health Check - Base de Données

Vérifie l'état de toutes les tables de la base de données.

```bash
curl https://boom-new.boofactory.ch/api/health/database
```

**Réponse**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "checks": {
      "connected": true,
      "tables": {
        "photomatons": { "exists": true, "count": 2 },
        "events": { "exists": true, "count": 15 },
        "photos": { "exists": true, "count": 245 },
        "settings": { "exists": true, "count": 3 },
        ...
      },
      "migrations": {
        "executed": true,
        "count": 1,
        "latest": "20251026000000_init"
      }
    },
    "missingTables": [],
    "recommendations": []
  }
}
```

### 2. Exécuter un Test Spécifique

```bash
curl -X POST https://boom-new.boofactory.ch/api/test/run \
  -H "Content-Type: application/json" \
  -H "X-Test-API-Key: VOTRE_API_KEY" \
  -d '{"test": "database"}'
```

**Tests disponibles**:
- `database` - Test de connexion et comptage des tables
- `settings` - Test CRUD sur la table settings
- `auth` - Test des variables d'environnement d'authentification
- `notion` - Test de configuration Notion
- `all` - Exécute tous les tests

**Réponse exemple** (test `database`):
```json
{
  "success": true,
  "data": {
    "test": "database",
    "timestamp": "2025-10-26T16:30:00.000Z",
    "passed": true,
    "details": {
      "connected": true,
      "tables": {
        "photomatons": 2,
        "events": 15,
        "photos": 245,
        "settings": 3,
        "users": 1
      }
    }
  }
}
```

**Réponse exemple** (test `settings`):
```json
{
  "success": true,
  "data": {
    "test": "settings",
    "timestamp": "2025-10-26T16:30:00.000Z",
    "passed": true,
    "details": {
      "success": true,
      "operations": {
        "create": true,
        "read": true,
        "update": true,
        "delete": true
      }
    }
  }
}
```

**Réponse exemple** (test `all`):
```json
{
  "success": true,
  "data": {
    "test": "all",
    "timestamp": "2025-10-26T16:30:00.000Z",
    "passed": true,
    "details": [
      {
        "name": "database",
        "passed": true,
        "details": { ... }
      },
      {
        "name": "settings",
        "passed": true,
        "details": { ... }
      },
      {
        "name": "auth",
        "passed": true,
        "details": { ... }
      },
      {
        "name": "notion",
        "passed": false,
        "details": {
          "success": false,
          "error": "Notion API credentials not configured"
        }
      }
    ]
  }
}
```

## Exemples d'Utilisation

### Test Rapide de la Base de Données

```bash
# Sans authentification - health check basique
curl https://boom-new.boofactory.ch/api/health/database | jq '.data.status'
```

### Test CRUD Settings

```bash
# Nécessite l'API key
curl -X POST https://boom-new.boofactory.ch/api/test/run \
  -H "Content-Type: application/json" \
  -H "X-Test-API-Key: YOUR_KEY_HERE" \
  -d '{"test": "settings"}' \
  | jq '.data.passed'
```

### Exécuter Tous les Tests

```bash
curl -X POST https://boom-new.boofactory.ch/api/test/run \
  -H "Content-Type: application/json" \
  -H "X-Test-API-Key: YOUR_KEY_HERE" \
  -d '{"test": "all"}' \
  | jq '.data.details[] | {name: .name, passed: .passed}'
```

## Codes de Statut HTTP

- `200` - Succès
- `400` - Requête invalide (test inconnu, paramètres manquants)
- `401` - Non autorisé (API key invalide ou manquante)
- `500` - Erreur serveur (test échoué)
- `503` - Service non disponible (TEST_API_KEY non configurée)

## Sécurité

- L'API key est requise pour tous les endpoints `/api/test/run`
- L'endpoint `/api/health/database` est public (pas d'auth requise)
- L'endpoint `/api/test/auth` GET génère une nouvelle clé (à protéger en production)
- Les tests CRUD créent et suppriment des données temporaires
- Utilisez cette API uniquement dans des environnements de développement/staging

## Notes pour Claude

En tant qu'assistant IA, je peux utiliser cette API pour:

1. **Diagnostiquer les problèmes** - Appeler `/api/health/database` pour voir l'état de la BDD
2. **Tester automatiquement** - Exécuter `{"test": "all"}` après un déploiement
3. **Vérifier les fixes** - Lancer des tests spécifiques pour confirmer qu'une correction fonctionne
4. **Débugger efficacement** - Les réponses détaillées montrent exactement ce qui ne va pas

### Workflow de Test Automatique

```bash
# 1. Déployer une nouvelle version
git push

# 2. Attendre le build (~2 min)
sleep 120

# 3. Vérifier la santé de la base de données
curl https://boom-new.boofactory.ch/api/health/database

# 4. Exécuter tous les tests
curl -X POST https://boom-new.boofactory.ch/api/test/run \
  -H "X-Test-API-Key: $TEST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": "all"}'

# 5. Rapporter les résultats à l'utilisateur
```

## Ajouter de Nouveaux Tests

Pour ajouter un nouveau test, éditer [src/app/api/test/run/route.ts](app/src/app/api/test/run/route.ts):

```typescript
async function testMyFeature(data?: any) {
  try {
    // Votre logique de test ici
    const result = await myFeatureTest();

    return {
      success: true,
      details: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

Puis ajouter dans le switch case:

```typescript
case 'myfeature':
  results.details = await testMyFeature(data);
  results.passed = results.details.success;
  break;
```
