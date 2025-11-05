# Portainer Stack Environment Variables

These environment variables must be defined in Portainer Stack settings for the application to work.

## Required Variables

### Database Configuration
```
DATABASE_URL=postgresql://boom_admin:YOUR_POSTGRES_PASSWORD@postgres:5432/boom_v2
```
**Note:** If your password contains special characters (@, :, /, etc.), they must be URL-encoded.
- Use `encodeURIComponent()` in JavaScript or an online URL encoder
- Example: `p@ss word!` becomes `p%40ss%20word%21`

### Redis Configuration
```
REDIS_URL=redis://:YOUR_REDIS_PASSWORD@redis:6379
```
**Note:** Same URL-encoding rules apply for Redis password.

### NextAuth
```
NEXTAUTH_SECRET=generate-a-random-secret-here-min-32-chars
```
Generate with: `openssl rand -base64 32`

### Admin Authentication
```
ADMIN_PASSWORD_HASH=your-bcrypt-hash-here
```
Generate with: `node -e "console.log(require('bcrypt').hashSync('your-password', 10))"`

## Optional Variables

### Notion Integration (can also be configured in Settings page)
```
NOTION_API_TOKEN=ntn_your_token_here
NOTION_DATABASE_ID=your-database-id-here
```

### Infomaniak OAuth (for future use)
```
INFOMANIAK_CLIENT_ID=your-client-id
INFOMANIAK_CLIENT_SECRET=your-client-secret
```

## How to Set in Portainer

1. Go to Portainer: https://portainer.boofactory.ch/
2. Navigate to **Stacks** → **le-boom**
3. Click **Editor** tab
4. Scroll down to **Environment variables**
5. Click **Add environment variable** for each variable
6. Enter **Name** and **Value**
7. Click **Update the stack**

## Important Notes

- Variables with special characters (@, :, /, %, #, etc.) in passwords **must** be URL-encoded
- Never commit actual passwords to Git
- The DATABASE_URL and REDIS_URL must match the passwords defined in the Postgres and Redis services
