# Mission API - Examples cURL

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All endpoints (except GET /missions list) require a JWT token in the Authorization header.

### Obtaining a Token

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "yourpassword"
  }'
```

Response:

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Endpoints

### 1. CREATE MISSION (Client only)

**POST** `/missions`

Creates a new mission. The clientId is taken from the authenticated user's token.

```bash
curl -X POST http://localhost:3000/api/v1/missions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "workerId": "uuid-of-worker",
    "serviceId": "uuid-of-service"
  }'
```

**Notes:**

- `clientId` is automatically set from the authenticated user's token
- `prixMin` and `prixMax` are copied from the Service
- Initial status: `PENDING_PAYMENT`

**Response (201):**

```json
{
  "success": true,
  "message": "Mission créée avec succès",
  "data": {
    "id": "mission-uuid",
    "clientId": "client-uuid",
    "workerId": "worker-uuid",
    "serviceId": "service-uuid",
    "prixMin": 1000,
    "prixMax": 5000,
    "prixFinal": null,
    "montantRestant": null,
    "cancellationRequestedBy": null,
    "status": "PENDING_PAYMENT",
    "createdAt": "2026-02-27T00:00:00.000Z",
    "updatedAt": "2026-02-27T00:00:00.000Z"
  }
}
```

---

### 2. LIST MISSIONS (Authenticated)

**GET** `/missions`

Lists missions with pagination. Filtered by user role:

- CLIENT: sees only their missions (as client)
- WORKER: sees only their missions (as worker)
- ADMIN: sees all missions

```bash
# Basic usage (sees own missions)
curl -X GET "http://localhost:3000/api/v1/missions?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

```bash
# Admin can filter by clientId or workerId
curl -X GET "http://localhost:3000/api/v1/missions?page=1&pageSize=10&clientId=uuid" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

```bash
# Get missions with details
curl -X GET "http://localhost:3000/api/v1/missions?page=1&pageSize=10&details=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "mission-uuid",
      "clientId": "client-uuid",
      "workerId": "worker-uuid",
      "serviceId": "service-uuid",
      "prixMin": 1000,
      "prixMax": 5000,
      "prixFinal": null,
      "montantRestant": null,
      "cancellationRequestedBy": null,
      "status": "PENDING_PAYMENT",
      "createdAt": "2026-02-27T00:00:00.000Z",
      "updatedAt": "2026-02-27T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 3. GET MISSION BY ID (Owner/Admin)

**GET** `/missions/:id`

Gets mission details. Only accessible by:

- The client who created the mission
- The worker assigned to the mission
- An admin

```bash
curl -X GET http://localhost:3000/api/v1/missions/mission-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "mission-uuid",
    "clientId": "client-uuid",
    "workerId": "worker-uuid",
    "serviceId": "service-uuid",
    "prixMin": 1000,
    "prixMax": 5000,
    "prixFinal": null,
    "montantRestant": null,
    "cancellationRequestedBy": null,
    "status": "PENDING_PAYMENT",
    "createdAt": "2026-02-27T00:00:00.000Z",
    "updatedAt": "2026-02-27T00:00:00.000Z"
  }
}
```

---

### 4. CONFIRM INITIAL PAYMENT

**POST** `/missions/:id/confirm-initial-payment`

Confirms the initial payment (prixMin). Transitions:
`PENDING_PAYMENT` → `CONTACT_UNLOCKED`

```bash
curl -X POST http://localhost:3000/api/v1/missions/mission-uuid/confirm-initial-payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**

```json
{
  "success": true,
  "message": "Paiement initial confirmé. Coordonnées du worker déverrouillées.",
  "data": {
    "id": "mission-uuid",
    "status": "CONTACT_UNLOCKED",
    ...
  }
}
```

---

### 5. SET FINAL PRICE

**POST** `/missions/:id/set-final-price`

Sets the final price after negotiation. Transitions:
`CONTACT_UNLOCKED` → `NEGOTIATION_DONE`

Then automatically:

- If `prixFinal > prixMin`: → `AWAITING_FINAL_PAYMENT`
- If `prixFinal === prixMin`: → `IN_PROGRESS`

```bash
curl -X POST http://localhost:3000/api/v1/missions/mission-uuid/set-final-price \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prixFinal": 3000
  }'
```

**Response (200):**

```json
{
  "success": true,
  "message": "Prix final fixé à 3000. En attente du paiement final.",
  "data": {
    "id": "mission-uuid",
    "prixFinal": 3000,
    "montantRestant": 2000,
    "status": "AWAITING_FINAL_PAYMENT",
    ...
  }
}
```

---

### 6. CONFIRM FINAL PAYMENT

**POST** `/missions/:id/confirm-final-payment`

Confirms the final payment. Transitions:

- `AWAITING_FINAL_PAYMENT` → `IN_PROGRESS`
- `NEGOTIATION_DONE` (if prixFinal === prixMin) → `IN_PROGRESS`

```bash
curl -X POST http://localhost:3000/api/v1/missions/mission-uuid/confirm-final-payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**

```json
{
  "success": true,
  "message": "Paiement final confirmé. Mission en cours.",
  "data": {
    "id": "mission-uuid",
    "status": "IN_PROGRESS",
    ...
  }
}
```

---

### 7. COMPLETE MISSION

**POST** `/missions/:id/complete`

Marks the mission as completed. Transitions:
`IN_PROGRESS` → `COMPLETED`

```bash
curl -X POST http://localhost:3000/api/v1/missions/mission-uuid/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**

```json
{
  "success": true,
  "message": "Mission terminée avec succès.",
  "data": {
    "id": "mission-uuid",
    "status": "COMPLETED",
    ...
  }
}
```

---

### 8. REQUEST CANCELLATION

**POST** `/missions/:id/request-cancellation`

Requests cancellation of an in-progress mission. Transitions:
`IN_PROGRESS` → `CANCEL_REQUESTED`

```bash
curl -X POST http://localhost:3000/api/v1/missions/mission-uuid/request-cancellation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "requester": "CLIENT"  # or "WORKER"
  }'
```

**Response (200):**

```json
{
  "success": true,
  "message": "Demande d'annulation soumise. En attente de validation Escrow.",
  "data": {
    "id": "mission-uuid",
    "status": "CANCEL_REQUESTED",
    "cancellationRequestedBy": "CLIENT",
    ...
  }
}
```

---

### 9. PROCESS CANCELLATION (Admin/Escrow)

**POST** `/missions/:id/process-cancellation`

Processes a cancellation request. Transitions:

- `CANCEL_REQUESTED` → `CANCELLED` (if approved)
- `CANCEL_REQUESTED` → `IN_PROGRESS` (if rejected)

```bash
curl -X POST http://localhost:3000/api/v1/missions/mission-uuid/process-cancellation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "approved": true
  }'
```

**Response (200):**

```json
{
  "success": true,
  "message": "Annulation approuvée. Mission annulée.",
  "data": {
    "id": "mission-uuid",
    "status": "CANCELLED",
    ...
  }
}
```

---

### 10. CANCEL MISSION (Direct)

**POST** `/missions/:id/cancel`

Cancels a mission directly (before work starts). Transitions:

- `PENDING_PAYMENT` → `CANCELLED`
- `CONTACT_UNLOCKED` → `CANCELLED`
- `NEGOTIATION_DONE` → `CANCELLED`
- `AWAITING_FINAL_PAYMENT` → `CANCELLED`

```bash
curl -X POST http://localhost:3000/api/v1/missions/mission-uuid/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**

```json
{
  "success": true,
  "message": "Mission annulée avec succès.",
  "data": {
    "id": "mission-uuid",
    "status": "CANCELLED",
    ...
  }
}
```

---

## State Machine Diagram

```
┌─────────────────┐
│ PENDING_PAYMENT │
└────────┬────────┘
         │ confirmInitialPayment
         ▼
┌─────────────────────┐
│   PENDING_ACCEPT   │
└─────────┬───────────┘
          │ accept (worker accepts)
          ▼
┌─────────────────────┐
│  CONTACT_UNLOCKED   │
└──────────┬──────────┘
           │ setFinalPrice
           ▼
┌───────────────────┐
│  NEGOTIATION_DONE │
└─────────┬─────────┘
          │
          ├─ prixFinal > prixMin ──► AWAITING_FINAL_PAYMENT
          │                                │
          │                          confirmFinalPayment
          │                                │
          └─ prixFinal = prixMin ──► IN_PROGRESS
                                           │
                                           ├─ complete ──► COMPLETED
                                           │
                                           └─ requestCancellation
                                                │
                                                ▼
                                      ┌───────────────────┐
                                      │ CANCEL_REQUESTED │
                                      └─────────┬─────────┘
                                                │
                                          processCancellation
                                                │
                              ┌─────────────────┴─────────────────┐
                              │                                   │
                              ▼                                   ▼
                        CANCELLED                         IN_PROGRESS
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Vous devez être authentifié."
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Vous n'êtes pas autorisé à accéder à cette mission."
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Mission introuvable."
}
```

### 400 Bad Request

```json
{
  "success": false,
  "message": "Transition invalide: impossible de passer de IN_PROGRESS à CONTACT_UNLOCKED."
}
```
