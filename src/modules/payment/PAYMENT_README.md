# Module Payment - SamaOuvrier Backend

## 📋 Overview

Ce module implémente un système complet de paiement avec **Escrow** pour le projet SamaOuvrier. Il intègre l'API **PayTech** en mode sandbox/test et prélève automatiquement une commission de **10%** sur chaque mission complétée.

---

## 🏗️ Architecture Clean Architecture

Le module suit les principes de Clean Architecture avec une séparation stricte des couches:

```
src/modules/payment/
├── domain/                    # Couche Domaine (cœur métier)
│   ├── entities/              # Entités Payment, Escrow
│   ├── value-objects/         # Value Object Money
│   ├── enums/                 # PaymentStatus, EscrowStatus
│   └── services/              # EscrowDomainService
│
├── application/               # Couche Application
│   ├── use-cases/             # CreatePayment, ReleaseEscrow, Cancel, Webhook
│   └── interfaces/             # IPaymentRepository
│
├── infrastructure/            # Couche Infrastructure
│   ├── prisma/               # PrismaPaymentRepository
│   └── paytech/              # PayTechService
│
└── interface/                # Couche Présentation
    ├── controllers/          # PaymentController
    ├── routes/               # payment.routes.ts
    └── validation/           # Schémas Zod
```

---

## 💰 Fonctionnalités

### 1. Paiement Initial (Escrow)

- Création automatique d'un **Payment** et d'un **Escrow**
- Montant bloqué en attente: **prixMin** de la mission
- Statut Escrow: `HELD` (bloqué)
- Statut Mission: `PENDING_PAYMENT` → `PENDING_ACCEPT`

### 2. Acceptation / Refus par le Worker

| Action   | Destination Worker | Source Client    | Statut Escrow | Statut Mission     |
| -------- | ------------------ | ---------------- | ------------- | ------------------ |
| Accepter | -                  | Contact débloqué | HELD          | `CONTACT_UNLOCKED` |
| Refuser  | 100% remboursé     | -                | `REFUNDED`    | `REFUSED`          |

### 3. Paiement Final & Completion

- **Double confirmation** requise (client + worker)
- Distribution des fonds:
  - **90%** → Worker
  - **10%** → Commission application
- Statut Escrow: `RELEASED`
- Statut Mission: `COMPLETED`

### 4. Annulation

| Scénario      | Client | Worker | Statut Escrow        |
| ------------- | ------ | ------ | -------------------- |
| Client annule | 70%    | 30%    | `PARTIALLY_REFUNDED` |
| Worker annule | 100%   | 0%     | `REFUNDED`           |

---

## 🔐 Sécurité

### Signature Webhook PayTech

Le webhook est sécurisé par signature HMAC-SHA512:

```typescript
const signature = crypto
  .createHmac("sha512", apiSecret)
  .update(rawBody)
  .digest("hex");
```

### Gestion d'Idempotence

Chaque paiement utilise une clé d'idempotence unique pour éviter les doublons:

```typescript
const idempotencyKey = `${missionId}-initial-${Date.now()}-${uuid}`;
```

---

## ⚙️ Configuration

Ajoutez les variables suivantes dans votre fichier `.env`:

```env
# PayTech (Sandbox/Test)
PAYTECH_API_KEY=votre_api_key
PAYTECH_API_SECRET=votre_api_secret
PAYTECH_BASE_URL=https://sandbox.paytech.sn/api
PAYTECH_ENV=test
PAYTECH_IPN_URL=https://ton-backend/api/payments/callback
PAYTECH_SUCCESS_URL=https://ton-frontend/success
PAYTECH_CANCEL_URL=https://ton-frontend/cancel
APPLICATION_COMMISSION_PERCENT=10
```

---

## 📡 Endpoints API

| Méthode | Route                              | Description                       |
| ------- | ---------------------------------- | --------------------------------- |
| `POST`  | `/api/payments`                    | Crée un paiement pour une mission |
| `POST`  | `/api/payments/:missionId/release` | Libère l'escrow (confirmation)    |
| `POST`  | `/api/payments/:missionId/cancel`  | Annule et rembourse               |
| `GET`   | `/api/payments/:missionId`         | Statut du paiement                |
| `POST`  | `/api/payments/callback`           | Webhook PayTech (public)          |

---

## 🧪 Comment Tester

### 1. Prérequis

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev
```

### 2. Créer une Mission

Utilisez l'endpoint existant pour créer une mission:

```bash
POST /api/services/:serviceId/missions
{
  "workerId": "uuid-worker",
  "prixMin": 10000,
  "prixMax": 15000
}
```

### 3. Initier le Paiement

```bash
POST /api/payments
Authorization: Bearer <token>
{
  "missionId": "uuid-mission"
}
```

Réponse:

```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "escrowId": "uuid",
    "paymentUrl": "https://sandbox.paytech.sn/payment/...",
    "amount": 10000
  }
}
```

### 4. Simuler le Paiement PayTech

En mode sandbox, PayTech simule les paiements. Utilisez l'URL de paiement retournée, puis:

```bash
# Appeler le webhook manuellement pour simuler le succès
POST /api/payments/callback
{
  "ref_command": "mission-uuid-initial-...",
  "token": "test-token",
  "amount": "10000",
  "currency": "XOF",
  "status": "000"
}
```

### 5. Accepter la Mission (Worker)

```bash
POST /api/payments/:missionId/release
Authorization: Bearer <worker-token>
{
  "role": "WORKER"
}
```

### 6. Confirmer la Completion (Client)

```bash
POST /api/payments/:missionId/release
Authorization: Bearer <client-token>
{
  "role": "CLIENT"
}
```

La mission passe à `COMPLETED` et les fonds sont distribués.

---

## 🔧 Utilisation en Production

Pour passer en mode production:

1. Modifier `PAYTECH_ENV=production`
2. Utiliser les clés API PayTech de production
3. Mettre à jour les URLs `success` et `cancel`

---

## 📊 Modèles de Données

### Payment

| Champ          | Type    | Description                        |
| -------------- | ------- | ---------------------------------- |
| id             | UUID    | ID unique                          |
| missionId      | UUID    | Mission associée                   |
| clientId       | UUID    | Client payeur                      |
| workerId       | UUID    | Worker bénéficiaire                |
| amount         | Decimal | Montant (XOF)                      |
| status         | Enum    | PENDING, SUCCESS, FAILED, REFUNDED |
| paytechRef     | String  | Référence PayTech                  |
| idempotencyKey | String  | Clé d'idempotence                  |

### Escrow

| Champ            | Type     | Description                       |
| ---------------- | -------- | --------------------------------- |
| id               | UUID     | ID unique                         |
| paymentId        | UUID     | Paiement associé                  |
| missionId        | UUID     | Mission associée                  |
| amount           | Decimal  | Montant total                     |
| workerAmount     | Decimal  | Montant worker (90%)              |
| commissionAmount | Decimal  | Commission (10%)                  |
| status           | Enum     | PENDING, HELD, RELEASED, REFUNDED |
| releasedAt       | DateTime | Date de libération                |

---

## ✅ Checklist de Sécurité

- [x] Signature webhook vérifiée
- [x] Clés d'idempotence uniques
- [x] Authentification JWT sur les routes protégées
- [x] Validation Zod sur les entrées
- [x] Transactions Prisma pour atomicité
- [x] Pas de logique métier dans les controllers
- [x] Injection de dépendances dans les use cases

---

## 📝 Notes

- Le module utilise **Prisma** avec PostgreSQL
- Les valeurs monétaires sont en **XOF** (Franc CFA)
- La commission est configurable via `APPLICATION_COMMISSION_PERCENT`
- Tous les messages d'erreur sont en français
