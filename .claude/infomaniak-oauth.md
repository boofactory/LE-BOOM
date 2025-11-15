# Authentification Infomaniak OAuth2

## Configuration

### 1. Créer une application OAuth2 sur Infomaniak

1. Aller sur **Infomaniak Manager**: https://manager.infomaniak.com/v3/ng/products/cloud/ik-auth
2. Cliquer sur **"Créer une application"**
3. Remplir les informations:
   - **Nom**: "BOOM v2"
   - **Description**: "Application de gestion d'événements BooFactory"
   - **URL de redirection**: `https://boom.boofactory.ch/api/auth/callback/infomaniak`
     - Pour dev local: `http://localhost:3000/api/auth/callback/infomaniak`
4. Récupérer:
   - **Client ID** (ID de l'application)
   - **Client Secret** (Secret de l'application)

### 2. Configurer les variables d'environnement

Ajouter dans `.env.local` (ou `.env.production` pour prod):

```bash
# Infomaniak OAuth
INFOMANIAK_CLIENT_ID=votre_client_id
INFOMANIAK_CLIENT_SECRET=votre_client_secret
NEXT_PUBLIC_INFOMANIAK_ENABLED=true
```

### 3. Configuration NextAuth

Le provider Infomaniak est déjà configuré dans `src/lib/auth.ts`:
- **Authorization endpoint**: `https://login.infomaniak.com/authorize`
- **Token endpoint**: `https://login.infomaniak.com/token`
- **UserInfo endpoint**: `https://login.infomaniak.com/oauth2/userinfo`
- **Scopes**: `openid email profile`

### 4. Redémarrer l'application

```bash
# Development
npm run dev

# Production (Docker)
# Rebuild and restart the container
```

## Utilisation

### Page de connexion

Quand `NEXT_PUBLIC_INFOMANIAK_ENABLED=true`, un bouton "Se connecter avec Infomaniak" s'affiche sur la page `/login`.

### Flow d'authentification

1. **Utilisateur clique sur "Se connecter avec Infomaniak"**
2. **Redirection vers Infomaniak**: `https://login.infomaniak.com/authorize`
3. **Utilisateur s'authentifie** sur Infomaniak avec ses identifiants
4. **Infomaniak redirige** vers `https://boom.boofactory.ch/api/auth/callback/infomaniak`
5. **NextAuth récupère** le code d'autorisation et échange contre un access token
6. **NextAuth récupère** les informations utilisateur (email, nom, profil)
7. **Session créée** et utilisateur redirigé vers `/dashboard`

### Données récupérées

Depuis Infomaniak, on récupère:
- **sub**: ID utilisateur unique
- **email**: Email de l'utilisateur
- **name**: Nom complet
- **given_name**: Prénom
- **family_name**: Nom de famille
- **picture**: Photo de profil (optionnel)

## Sécurité

### HTTPS obligatoire

L'OAuth2 nécessite HTTPS en production. Les URLs de redirection doivent être:
- ✅ `https://boom.boofactory.ch/api/auth/callback/infomaniak`
- ❌ `http://boom.boofactory.ch/api/auth/callback/infomaniak` (non sécurisé)

Exception: `http://localhost:3000` est autorisé pour le développement.

### Client Secret

⚠️ **Ne jamais commiter le Client Secret** dans le code source !

Le Client Secret doit être:
- Stocké dans `.env.local` (ignoré par git)
- Configuré dans les variables d'environnement Docker/Portainer en production
- Considéré comme un mot de passe

### Scopes

Les scopes demandés sont:
- **openid**: Authentification OpenID Connect
- **email**: Accès à l'email de l'utilisateur
- **profile**: Accès au nom et prénom de l'utilisateur

## Troubleshooting

### Erreur "redirect_uri_mismatch"

**Cause**: L'URL de redirection n'est pas exactement la même que celle configurée sur Infomaniak.

**Solution**:
1. Vérifier l'URL dans Infomaniak Manager
2. S'assurer qu'elle correspond exactement (avec https://, sans trailing slash)
3. Format attendu: `https://boom.boofactory.ch/api/auth/callback/infomaniak`

### Erreur "invalid_client"

**Cause**: Client ID ou Client Secret incorrect.

**Solution**:
1. Vérifier les variables d'environnement
2. Régénérer le Client Secret si nécessaire sur Infomaniak Manager
3. Redémarrer l'application après modification

### Utilisateur non créé automatiquement

**Note**: L'authentification OAuth ne crée pas automatiquement un utilisateur en base de données.

**Options**:
1. **Autoriser auto-création**: Modifier le callback `signIn` dans `auth.ts` pour créer automatiquement l'utilisateur
2. **Pré-créer les utilisateurs**: Créer manuellement les utilisateurs avec leur email Infomaniak

## Fallback authentification locale

L'authentification locale (username/password) reste disponible même avec Infomaniak activé.

Cela permet:
- ✅ Accès de secours si Infomaniak est indisponible
- ✅ Comptes techniques (bots, services)
- ✅ Développement sans compte Infomaniak

## Documentation Infomaniak

- **Developer Portal**: https://developer.infomaniak.com/getting-started
- **OAuth2/OpenID Connect**: https://github.com/Infomaniak/infomaniak-connect-openid
- **Support**: https://www.infomaniak.com/fr/support

---
*Dernière mise à jour: 2025-11-15*
