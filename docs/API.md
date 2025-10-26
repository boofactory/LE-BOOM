# API Documentation - LE BOOM v2

## Base URL

- **Production**: `https://boom.boofactory.ch/api`
- **Development**: `http://localhost:3000/api`

## Authentication

Toutes les routes API (sauf `/api/health`) requièrent une session authentifiée.

**Session Cookie**: `next-auth.session-token`

### Login

```http
POST /api/auth/signin
Content-Type: application/json

{
  "username": "boo-team",
  "password": "BOO1304Cossonay!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "name": "BooFactory Team",
    "role": "admin"
  }
}
```

---

## Photomatons

### List All Photomatons

```http
GET /api/photomatons
```

**Response** (200 OK):
```json
{
  "photomatons": [
    {
      "id": 1,
      "name": "Photomaton 1",
      "hostname": "photomaton-1",
      "tailscaleIp": "100.x.x.x",
      "routerTailscaleIp": "100.x.x.y",
      "routerConnected": true,
      "pcConnected": true,
      "lastSeen": "2025-10-26T12:30:00Z",
      "remainingPrints": 345,
      "warningThreshold": 350,
      "criticalThreshold": 275,
      "lastPrintUpdate": "2025-10-26T11:00:00Z",
      "currentEvent": {
        "id": 5,
        "clientName": "Client XYZ",
        "eventDate": "2025-10-27T18:00:00Z"
      },
      "stats": {
        "totalDigital": 120,
        "totalPrints": 85,
        "totalGifs": 12
      }
    }
  ]
}
```

### Get Single Photomaton

```http
GET /api/photomatons/:id
```

**Response** (200 OK): Same as list item above.

### Update Photomaton Configuration

```http
PATCH /api/photomatons/:id
Content-Type: application/json

{
  "warningThreshold": 400,
  "criticalThreshold": 300
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "photomaton": { /* updated data */ }
}
```

### Update Photomaton Status (Internal - called by agent)

```http
POST /api/photomatons/:id/status
Content-Type: application/json
Authorization: Bearer <agent_api_key>

{
  "routerConnected": true,
  "pcConnected": true,
  "remainingPrints": 340
}
```

---

## Events

### List Events

```http
GET /api/events?status=ACTIVE&limit=50
```

**Query Parameters**:
- `status`: `ACTIVE`, `COMPLETED`, `ARCHIVED` (default: all)
- `limit`: Number of results (default: 50, max: 100)
- `photomatonId`: Filter by photomaton

**Response** (200 OK):
```json
{
  "events": [
    {
      "id": 5,
      "notionPageId": "17fbfebc...",
      "clientName": "Client ABC",
      "eventType": "Mariage",
      "eventDate": "2025-10-27T18:00:00Z",
      "albumName": "Mariage_ABC_2025",
      "photomaton": {
        "id": 1,
        "name": "Photomaton 1"
      },
      "stats": {
        "totalSessions": 45,
        "totalDigital": 120,
        "totalPrints": 85,
        "totalGifs": 12
      },
      "status": "ACTIVE",
      "syncedAt": "2025-10-26T12:00:00Z"
    }
  ],
  "total": 3
}
```

### Get Event Details

```http
GET /api/events/:id
```

**Response** (200 OK):
```json
{
  "event": { /* full event data */ },
  "photos": [
    {
      "id": 123,
      "mediaType": "PRINT",
      "timestamp": "2025-10-26T14:30:00Z"
    }
  ]
}
```

### Delete Event

```http
DELETE /api/events/:id
```

**Response** (200 OK):
```json
{
  "success": true,
  "deleted": {
    "eventId": 5,
    "photosDeleted": 217
  }
}
```

---

## Notion Integration

### Sync Events from Notion

```http
POST /api/notion/sync
```

**Response** (200 OK):
```json
{
  "success": true,
  "synced": 3,
  "created": 1,
  "updated": 2,
  "errors": []
}
```

---

## Webhooks & Actions

### Trigger Photomaton Action

```http
POST /api/webhooks/action
Content-Type: application/json

{
  "photomatonId": 1,
  "action": "power_on"
}
```

**Actions disponibles**:
- `power_on`: Wake-on-LAN via routeur
- `power_off`: Shutdown PC
- `lock`: Lock screen (DSLR Booth)
- `unlock`: Unlock screen
- `print_test`: Test impression

**Response** (200 OK):
```json
{
  "success": true,
  "action": "power_on",
  "photomatonId": 1,
  "executedAt": "2025-10-26T12:45:00Z"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Photomaton offline",
  "details": "Router not connected"
}
```

---

## Agent Sync (Phase 2)

### Sync Agent Data

```http
POST /api/agent/sync
Content-Type: application/json
Authorization: Bearer <agent_api_key>

{
  "hostname": "photomaton-1",
  "stats": [
    {
      "type": "PRINT",
      "count": 5,
      "timestamp": "2025-10-26T12:30:00Z"
    },
    {
      "type": "DIGITAL",
      "count": 12,
      "timestamp": "2025-10-26T12:35:00Z"
    }
  ],
  "paperLevel": 340,
  "speedtest": {
    "download": 45.2,
    "upload": 12.5,
    "ping": 23
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "photomatonId": 1,
  "photosInserted": 17,
  "speedTestInserted": true,
  "syncedAt": "2025-10-26T12:40:00Z"
}
```

---

## Statistics

### Global Statistics

```http
GET /api/stats/global
```

**Response** (200 OK):
```json
{
  "totalEvents": 24,
  "averages": {
    "sessionsPerEvent": 42.5,
    "printsPerEvent": 78.2,
    "gifsPerEvent": 15.3,
    "digitalPerEvent": 125.6
  },
  "records": {
    "maxSessions": {
      "value": 150,
      "eventName": "Mariage XYZ"
    },
    "maxPrints": {
      "value": 320,
      "eventName": "Festival ABC"
    }
  }
}
```

### Photomaton Statistics

```http
GET /api/stats/photomaton/:id?period=7d
```

**Query Parameters**:
- `period`: `24h`, `7d`, `30d`, `all` (default: `7d`)

**Response** (200 OK):
```json
{
  "photomatonId": 1,
  "period": "7d",
  "stats": {
    "totalEvents": 3,
    "totalPhotos": 450,
    "totalPrints": 280,
    "totalGifs": 35,
    "avgPhotosPerEvent": 150
  },
  "timeline": [
    {
      "date": "2025-10-26",
      "photos": 120,
      "prints": 85
    }
  ]
}
```

---

## SpeedTests

### Get SpeedTest History

```http
GET /api/speedtests/:photomatonId?limit=20
```

**Response** (200 OK):
```json
{
  "speedtests": [
    {
      "id": 45,
      "downloadSpeed": 45.2,
      "uploadSpeed": 12.5,
      "ping": 23,
      "createdAt": "2025-10-26T12:00:00Z"
    }
  ]
}
```

---

## Health Check

### Application Health

```http
GET /api/health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-10-26T12:45:00Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  },
  "uptime": 86400
}
```

**Response** (503 Service Unavailable):
```json
{
  "status": "unhealthy",
  "errors": ["Database connection failed"]
}
```

---

## WebSocket Events

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('https://boom.boofactory.ch', {
  auth: { token: sessionToken }
});
```

### Events Server → Client

#### `photomaton:updated`
```json
{
  "photomatonId": 1,
  "data": {
    "routerConnected": true,
    "pcConnected": true,
    "remainingPrints": 340
  }
}
```

#### `event:created`
```json
{
  "event": { /* full event data */ }
}
```

#### `event:updated`
```json
{
  "eventId": 5,
  "changes": {
    "totalPrints": 90
  }
}
```

#### `stats:updated`
```json
{
  "type": "global",
  "data": { /* updated stats */ }
}
```

### Events Client → Server

#### `photomaton:subscribe`
```javascript
socket.emit('photomaton:subscribe', { photomatonId: 1 });
```

#### `photomaton:unsubscribe`
```javascript
socket.emit('photomaton:unsubscribe', { photomatonId: 1 });
```

---

## Error Responses

Toutes les erreurs suivent ce format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { /* optional additional context */ }
}
```

### HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service down

### Error Codes

- `AUTH_REQUIRED`: Authentication needed
- `INVALID_CREDENTIALS`: Wrong username/password
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `PHOTOMATON_OFFLINE`: Photomaton not reachable
- `ACTION_FAILED`: Action execution failed
- `DATABASE_ERROR`: Database operation failed

---

## Rate Limiting

- **Global**: 100 requests/minute per IP
- **Authentication**: 5 failed attempts/5 minutes
- **Actions**: 10 requests/minute per photomaton

**Response** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 45
}
```

---

## Pagination

Endpoints returning lists support pagination:

```http
GET /api/events?page=2&limit=20
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 125,
    "pages": 7
  }
}
```
