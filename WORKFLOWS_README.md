# SamaOuvrier - Documentation des Workflows

> Guide complet des flux de travail pour les utilisateurs de la plateforme SamaOuvrier

---

## Table des Matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Rôles et Permissions](#2-rôles-et-permissions)
3. [Workflow Admin](#3-workflow-admin)
4. [Workflow Worker (Prestataire)](#4-workflow-worker-prestataire)
5. [Workflow Client](#5-workflow-client)
6. [Flux des Missions](#6-flux-des-missions)
7. [Système de Paiement et Escrow](#7-système-de-paiement-et-escrow)
8. [Gestion des Litiges](#8-gestion-des-litiges)
9. [Système de Notifications](#9-système-de-notifications)
10. [Diagrammes des Flux](#10-diagrammes-des-flux)

---

## 1. Vue d'Ensemble

**SamaOuvrier** est une plateforme de mise en relation entre clients et prestataires de services au Sénégal. Le système permet :

- ✅ Inscription et authentification sécurisée
- ✅ Publication de services par les prestataires
- ✅ Création et gestion de missions
- ✅ Paiement sécurisé avec système Escrow
- ✅ Résolution de litiges
- ✅ Système de notations et avis
- ✅ Tableaux de bord analytiques

---

## 2. Rôles et Permissions

### 2.1 Les Trois Rôles Utilisateurs

| Rôle       | Description                      | Accès                                   |
| ---------- | -------------------------------- | --------------------------------------- |
| **CLIENT** | Particulier cherchant un service | Routes publiques + ses missions         |
| **WORKER** | Prestataire de services          | Routes worker + ses services + missions |
| **ADMIN**  | Administrateur de la plateforme  | Toutes les routes admin                 |

### 2.2 Statut du Travailleur (WorkerStatus)

Les travailleurs ont un statut secondaire qui détermine leur accès :

| Statut       | Signification            | Accès                                      |
| ------------ | ------------------------ | ------------------------------------------ |
| **PENDING**  | En attente de validation | Connexion bloquée                          |
| **APPROVED** | Validé par l'admin       | Accès complet                              |
| **REJECTED** | Rejeté par l'admin       | Connexion bloquée + possibilité de reapply |

---

## 3. Workflow Admin

### 3.1 Tableau de Bord Administrateur

L'administrateur accède à un tableau de bord complet via [`GET /api/dashboard/admin`](src/modules/dashboard/interface/dashboard.routes.ts:59) avec les statistiques suivantes :

- **Utilisateurs** : Nombre total, nouveaux utilisateurs, actifs, bannis
- **Missions** : Total, en cours, terminées, annulées
- **Paiements** : Volume total, commissions perçues
- **Litiges** : Nombre de litiges ouverts, en cours, résolus
- **Période** : Filtrage sur 7j, 30j, 90j, 1an ou dates personnalisées

### 3.2 Gestion des Travailleurs

#### Liste des workers

```http
GET /api/admin/workers?status=PENDING&page=1&pageSize=10
```

- Filtrage par statut : `PENDING`, `APPROVED`, `REJECTED`
- Pagination obligatoire

#### Approbation d'un worker

```http
PATCH /api/admin/workers/{id}/approve
```

**Conditions :**

- Le worker doit être en statut `PENDING`
- Retourne le worker avec `workerStatus = APPROVED`
- Notification envoyée au worker

#### Rejet d'un worker

```http
PATCH /api/admin/workers/{id}/reject
```

**Corps de la requête :**

```json
{
  "reason": "Documents incomplets"
}
```

**Conditions :**

- Le worker doit être en statut `PENDING`
- La raison de rejet est obligatoire
- Retourne le worker avec `workerStatus = REJECTED`
- Notification envoyée au worker avec la raison

### 3.3 Gestion des Utilisateurs

L'admin peut gérer tous les utilisateurs :

| Méthode | Route            | Description           |
| ------- | ---------------- | --------------------- |
| GET     | `/api/users`     | Liste paginée         |
| GET     | `/api/users/:id` | Détails utilisateur   |
| POST    | `/api/users`     | Créer utilisateur     |
| PUT     | `/api/users/:id` | Modifier utilisateur  |
| DELETE  | `/api/users/:id` | Supprimer utilisateur |

#### Actions administratives supplémentaires :

| Méthode | Route                              | Description               |
| ------- | ---------------------------------- | ------------------------- |
| PATCH   | `/api/admin/users/:id/activate`    | Activer un utilisateur    |
| PATCH   | `/api/admin/users/:id/deactivate`  | Désactiver un utilisateur |
| PATCH   | `/api/admin/users/:id/ban`         | Bannir un utilisateur     |
| PATCH   | `/api/admin/users/:id/unban`       | Débannir un utilisateur   |
| DELETE  | `/api/admin/users/:id/soft-delete` | Suppression douce         |

### 3.4 Gestion des Métiers (Professions)

```http
POST /api/professions
{
  "name": "Plombier",
  "description": "Expert en plomberie et installation sanitaire"
}
```

### 3.5 Résolution des Litiges

L'admin peut résoudre un litige via [`POST /api/disputes/{id}/resolve`](src/modules/dispute/interface/dispute.routes.ts) :

```json
{
  "resolution": "PARTIAL_REFUND",
  "resolutionNote": "Le worker n'a pas terminé le travail",
  "releaseAmount": 5000
}
```

**Résolutions possibles :**

- `CLIENT_WINS` → Remboursement complet au client
- `WORKER_WINS` → Paiement complet au worker
- `PARTIAL_REFUND` → Remboursement partiel
- `FULL_REFUND` → Remboursement total
- `NO_REFUND` → Aucun remboursement
- `DRAW` → Partage égale des fonds

---

## 4. Workflow Worker (Prestataire)

### 4.1 Inscription Worker

```http
POST /api/auth/register
{
  "nom": "Diop",
  "prenom": "Moussa",
  "adresse": "Dakar, Senegal",
  "tel": "771234567",
  "email": "moussa.diop@email.com",
  "password": "motdepasse123",
  "role": "WORKER",
  "professionId": "uuid-profession",
  "identityCardRecto": "url_image_cni_recto",
  "identityCardVerso": "url_image_cni_verso"
}
```

**Conséquence :**

- Le compte est créé avec `workerStatus = PENDING`
- Le worker ne peut PAS se connecter
- Une notification est envoyée à l'admin

### 4.2 Connexion Worker

```http
POST /api/auth/login
{
  "email": "moussa.diop@email.com",
  "password": "motdepasse123"
}
```

**Conditions :**

- ✅ Email et mot de passe corrects
- ✅ Rôle = WORKER
- ✅ `workerStatus = APPROVED`

**Sinon :**

- ❌ `PENDING` : "Votre compte est en attente de validation"
- ❌ `REJECTED` : "Votre compte a été rejeté. Motif: ..."

### 4.3 Profil Worker

#### Voir son profil

```http
GET /api/workers/me
```

#### Modifier son profil

```http
PUT /api/workers/me
{
  "adresse": "Nouveau adresse",
  "tel": "779999999"
}
```

### 4.4 Services du Worker

#### Créer un service

```http
POST /api/services
{
  "title": "Installation plomberie",
  "description": "Installation complète de plomberie pour maison",
  "minPrice": 50000,
  "maxPrice": 500000
}
```

**Règles :**

- Un worker ne peut pas avoir deux services avec le même titre
- Le prix minimum doit être inférieur au prix maximum

#### Modifier un service

```http
PUT /api/services/{id}
```

#### Supprimer un service

```http
DELETE /api/services/{id}
```

### 4.5 Missions du Worker

#### Voir ses missions

```http
GET /api/workers/me/missions
```

- Retourne uniquement les missions où le worker est le prestataire
- Inclut les détails du client et du service

#### Accepter une mission

```http
POST /api/missions/{id}/accept
```

**Conditions :**

- Mission en statut `PENDING_ACCEPT`
- Le worker doit être le destinataire

**Conséquence :**

- Statut → `CONTACT_UNLOCKED`
- Coordonnées client débloquées
- Notification au client

#### Refuser une mission

```http
POST /api/missions/{id}/refuse
```

**Conditions :**

- Mission en statut `PENDING_ACCEPT`

**Conséquence :**

- Statut → `REFUSED`
- Remboursement automatique du paiement initial
- Notification au client

### 4.6 Négociation du Prix Final

Le worker peut proposer un prix final :

```http
POST /api/missions/{id}/set-final-price
{
  "prixFinal": 75000
}
```

**Conditions :**

- Mission en statut `CONTACT_UNLOCKED` ou `NEGOTIATION_DONE`
- Le prix final doit être dans la fourchette [prixMin, prixMax]

### 4.7 Démarrer la mission

```http
POST /api/missions/{id}/start
```

**Conditions :**

- Mission acceptée
- Paiement initial confirmé

**Conséquence :**

- Statut → `IN_PROGRESS`

### 4.8 Confirmer la fin de la mission (Worker)

```http
POST /api/missions/{id}/complete
```

**Conditions :**

- Mission en cours (`IN_PROGRESS`)
- Le worker confirme que le travail est terminé

**Conséquence :**

- `workerConfirmed = true`
- Si le client a aussi confirmé → Mission terminée

### 4.9 Demande d'Annulation

```http
POST /api/missions/{id}/request-cancellation
```

**Conditions :**

- Mission en cours ou en négociation

**Conséquence :**

- Statut → `CANCEL_REQUESTED`
- Motif obligatoire

### 4.10 Re-application après rejet

Si le worker a été rejeté, il peut refaire une demande :

```http
PATCH /api/workers/me/reapply
```

**Conditions :**

- `workerStatus = REJECTED`

**Conséquence :**

- `workerStatus = PENDING`
- Notification à l'admin

### 4.11 Tableau de Bord Worker

```http
GET /api/dashboard/worker
```

Retourne :

- Nombre de missions (total, en cours, terminées)
- Revenus (total, ce mois)
- Note moyenne et nombre d'avis
- Litiges en cours

---

## 5. Workflow Client

### 5.1 Inscription Client

```http
POST /api/auth/register
{
  "nom": "Sall",
  "prenom": "Aïcha",
  "adresse": "Dakar, Senegal",
  "tel": "761234567",
  "email": "aicha.sall@email.com",
  "password": "motdepasse123",
  "role": "CLIENT"
}
```

**Conséquence :**

- Le client est créé directement avec accès complet
- Aucune validation nécessaire

### 5.2 Connexion Client

```http
POST /api/auth/login
{
  "email": "aicha.sall@email.com",
  "password": "motdepasse123"
}
```

### 5.3 Recherche de Prestataires

#### Liste des workers publics

```http
GET /api/workers/public?professionId=uuid&page=1&pageSize=10
```

#### Voir les services d'un worker

```http
GET /api/workers/{workerId}/services
```

#### Liste des services

```http
GET /api/services?page=1&pageSize=10
```

### 5.4 Création d'une Mission

```http
POST /api/missions
{
  "workerId": "uuid-worker",
  "serviceId": "uuid-service"
}
```

**Conditions :**

- Être authentifié en tant que CLIENT
- Le worker doit être `APPROVED`
- Le service doit appartenir au worker

**Conséquence :**

- Mission créée avec `status = PENDING_PAYMENT`
- Prix.min et prix.max récupérés du service

### 5.5 Paiement Initial

Le client doit effectuer le paiement initial (prixMin) pour débloquer la mission :

```http
POST /api/payments
{
  "missionId": "uuid-mission"
}
```

**Flux :**

1. Création du paiement et de l'escrow
2. Retour de l'URL de paiement PayTech
3. Redirection vers PayTech
4. Webhook callback met à jour le statut

**Conséquence :**

- Mission → `PENDING_ACCEPT`
- Notification au worker

### 5.6 Suivi des Missions

```http
GET /api/missions
```

- Retourne uniquement les missions du client

### 5.7 Confirmation du Paiement Final (si applicable)

Si le prix final > prixMin, le client doit payer la différence :

```http
POST /api/missions/{id}/confirm-final-payment
```

### 5.8 Confirmer la fin de la mission (Client)

```http
POST /api/missions/{id}/complete
```

**Conditions :**

- Mission en cours (`IN_PROGRESS`)
- Le client confirme que le travail est terminé

**Conséquence :**

- `clientConfirmed = true`
- Si le worker a aussi confirmé → Mission terminée

### 5.9 Demande d'Annulation

```http
POST /api/missions/{id}/request-cancellation
```

### 5.10 Ouverture d'un Litige

```http
POST /api/disputes
{
  "missionId": "uuid-mission",
  "reason": "WORK_NOT_DONE",
  "description": "Le worker n'a pas terminé le travail malgré plusieurs relances"
}
```

### 5.11 Laisser un Avis

Après mission complétée :

```http
POST /api/reviews
{
  "missionId": "uuid-mission",
  "rating": 5,
  "comment": "Excellente prestation, très professionnel!"
}
```

**Conditions :**

- Mission en statut `COMPLETED`
- Le client n'a pas encore laissé d'avis pour cette mission

### 5.12 Tableau de Bord Client

```http
GET /api/dashboard/client
```

Retourne :

- Nombre de missions (total, en cours, terminées)
- Dépenses totales
- Litiges en cours

---

## 6. Flux des Missions

### 6.1 Cycle de Vie Complet d'une Mission

```
┌─────────────────┐
│  CREATION       │
│  (Client)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PENDING_PAYMENT │ ←── Mission créée, en attente de paiement
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PENDING_ACCEPT  │ ←── Paiement confirmé, en attente acceptation worker
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌─────────┐
│ ACCEPT │ │ REFUSE  │
└────┬───┘ └────┬────┘
     │          │
     ▼          ▼
┌────────────┐ ┌────────────┐
│ CONTACT_    │ │ REFUSED    │
│ UNLOCKED    │ └────────────┘
└─────┬──────┘
      │
      ▼
┌─────────────┐
│ NEGOTIATION_│
│ DONE        │ ←── Prix final défini (optionnel)
└─────┬───────┘
      │
      ▼
┌──────────────────┐
│ AWAITING_FINAL_  │ ←── Si prixFinal > prixMin
│ PAYMENT          │
└────────┬─────────┘
        │
        ▼
┌────────────┐
│ IN_PROGRESS│ ←── Mission en cours
└─────┬──────┘
      │
      ▼
┌────────────────┐
│ COMPLETED     │ ←── Double confirmation client + worker
└────────────────┘
```

### 6.2 Statuts des Missions

| Statut                   | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `PENDING_PAYMENT`        | Mission créée, en attente du paiement initial    |
| `PENDING_ACCEPT`         | Paiement confirmé, worker doit accepter          |
| `CONTACT_UNLOCKED`       | Worker a accepté, coordonnées client disponibles |
| `NEGOTIATION_DONE`       | Prix final négocié                               |
| `AWAITING_FINAL_PAYMENT` | En attente du paiement de la différence          |
| `IN_PROGRESS`            | Mission en cours                                 |
| `COMPLETED`              | Mission terminée (double confirmation)           |
| `CANCEL_REQUESTED`       | Annulation demandée                              |
| `CANCELLED`              | Mission annulée                                  |
| `REFUSED`                | Worker a refusé la mission                       |

---

## 7. Système de Paiement et Escrow

### 7.1 Architecture du Paiement

Le système utilise **PayTech** comme provider de paiement et un système d'**Escrow** pour sécuriser les transactions.

### 7.2 Flux de Paiement

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   CLIENT   │────▶│   BACKEND    │────▶│  PAYTECH   │
│            │     │              │     │  (paiement)│
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    ESCROW    │
                    │   (bloqué)   │
                    └──────────────┘
```

### 7.3 Paiement Initial

| Montant          | Destination      |
| ---------------- | ---------------- |
| `prixMin` (100%) | Bloqué en Escrow |

### 7.4 Libération de l'Escrow (Mission Terminée)

| Part       | Montant | Destination      |
| ---------- | ------- | ---------------- |
| Worker     | 90%     | Compte du worker |
| Commission | 10%     | Plateforme       |

### 7.5 Scénarios de Remboursement

#### Worker refuse la mission

| Part   | Montant        |
| ------ | -------------- |
| Client | 100% remboursé |

#### Annulation demandée par le Client

| Part   | Montant         |
| ------ | --------------- |
| Client | 70% remboursé   |
| Worker | 30% (indemnité) |

#### Annulation demandée par le Worker

| Part   | Montant        |
| ------ | -------------- |
| Client | 100% remboursé |

#### Litige résolu - Client gagne

| Part   | Montant        |
| ------ | -------------- |
| Client | 100% remboursé |

#### Litige résolu - Worker gagne

| Part       | Montant |
| ---------- | ------- |
| Worker     | 90%     |
| Commission | 10%     |

### 7.6 Endpoints de Paiement

| Méthode | Route                               | Description              |
| ------- | ----------------------------------- | ------------------------ |
| POST    | `/api/payments`                     | Créer un paiement        |
| POST    | `/api/payments/callback`            | Webhook PayTech (public) |
| POST    | `/api/payments/{missionId}/release` | Libérer l'escrow         |
| POST    | `/api/payments/{missionId}/cancel`  | Annuler et rembourser    |
| GET     | `/api/payments/{missionId}`         | Statut du paiement       |

### 7.7 Configuration Requise

```env
PAYTECH_API_KEY=votre_api_key
PAYTECH_API_SECRET=votre_api_secret
PAYTECH_BASE_URL=https://sandbox.paytech.sn/api
APPLICATION_COMMISSION_PERCENT=10
```

---

## 8. Gestion des Litiges

### 8.1 Ouverture d'un Litige

```http
POST /api/disputes
{
  "missionId": "uuid-mission",
  "reason": "QUALITY_UNSATISFACTORY",
  "description": "Le travail realizado ne correspond pas aux attentes",
  "files": [fichiers_evidence]
}
```

### 8.2 Motifs de Litige

| Motif                    | Description                  |
| ------------------------ | ---------------------------- |
| `PAYMENT_ISSUE`          | Problème de paiement         |
| `WORK_NOT_DONE`          | Travail non terminé          |
| `QUALITY_UNSATISFACTORY` | Qualité insuffisante         |
| `NO_SHOW`                | Worker ne s'est pas présenté |
| `CANCELLATION_ISSUE`     | Problème d'annulation        |
| `COMMUNICATION_ISSUE`    | Problème de communication    |
| `OTHER`                  | Autre raison                 |

### 8.3 Cycle de Vie d'un Litige

```
PENDING → OPEN → UNDER_REVIEW → RESOLVED → CLOSED
```

| Statut         | Description                           |
| -------------- | ------------------------------------- |
| `PENDING`      | Litige créé, en attente de traitement |
| `OPEN`         | Litige examiné par l'admin            |
| `UNDER_REVIEW` | En cours d'investigation              |
| `RESOLVED`     | Décision prise                        |
| `CLOSED`       | Litige clos                           |

### 8.4 Résolution par l'Admin

```http
POST /api/disputes/{id}/resolve
{
  "resolution": "PARTIAL_REFUND",
  "resolutionNote": "Le worker doit être rémunéré partiellement",
  "releaseAmount": 5000
}
```

### 8.5 Ajout d'Évidence

```http
POST /api/disputes/{id}/evidence
{
  "description": "Photos du travail",
  "file": fichier
}
```

---

## 9. Système de Notifications

### 9.1 Types de Notifications

Le système notifie les utilisateurs pour :

| Événement                 | Destinataire   |
| ------------------------- | -------------- |
| Nouveau worker en attente | Admin          |
| Worker approuvé/rejeté    | Worker         |
| Nouvelle mission créée    | Worker         |
| Paiement confirmé         | Client, Worker |
| Mission acceptée/refusée  | Client         |
| Mission terminée          | Client, Worker |
| Nouveau litige            | Admin          |
| Litige résolu             | Client, Worker |
| Nouveau paiement          | Admin          |

### 9.2 Consultations des Notifications

```http
GET /api/notifications
```

### 9.3 Marquer comme lu

```http
PATCH /api/notifications/{id}/read
```

---

## 10. Diagrammes des Flux

### 10.1 Flux d'Inscription Worker

```
┌─────────────────────────────────────────────────────────────┐
│                    INSCRIPTION WORKER                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ POST /api/auth/register                                      │
│ { role: "WORKER", professionId: "..." }                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ ✅ User créé                                                │
│ ✅ workerStatus = PENDING                                    │
│ ❌ Connexion bloquée                                        │
│ 🔔 Notification admin                                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    VALIDATION ADMIN                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐
│  APPROVE        │              │  REJECT         │
│ workerStatus =  │              │ workerStatus =  │
│ APPROVED        │              │ REJECTED        │
│ 🔔 Worker       │              │ + reason        │
└─────────────────┘              │ 🔔 Worker       │
                                └─────────────────┘
```

### 10.2 Flux de Mission Complète

```
┌─────────────────────────────────────────────────────────────┐
│                  CRÉATION MISSION (CLIENT)                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ POST /api/missions { workerId, serviceId }                   │
│ status = PENDING_PAYMENT                                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              PAIEMENT INITIAL (CLIENT)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ POST /api/payments { missionId }                             │
│ → URL PayTech                                               │
│ → Paiement → Webhook                                        │
│ status = PENDING_ACCEPT                                      │
│ 💰 Escrow bloqué (prixMin)                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           ACCEPTATION MISSION (WORKER)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐
│  ACCEPT         │              │  REFUSE        │
│ status =        │              │ status =       │
│ CONTACT_UNLOCKED│              │ REFUSED        │
│ 📞 Contact      │              │ 💰 Remboursé   │
│   débloqué      │              │   (100%)       │
└─────────────────┘              └─────────────────┘
```

### 10.3 Flux de Paiement Final

```
┌─────────────────────────────────────────────────────────────┐
│              NÉGOCIATION PRIX (WORKER)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ POST /api/missions/{id}/set-final-price                     │
│ { prixFinal: 75000 }                                        │
│ status = NEGOTIATION_DONE                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│          PAIEMENT RESTANT (SI PRIXFINAL > PRIXMIN)          │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │   Si prixFinal > prixMin       │
         ▼                                 ▼
┌─────────────────┐              ┌─────────────────────────┐
│ PAIEMENT        │              │ PASSER DIRECT            │
│ RESTANT         │              │ (prixFinal ≤ prixMin)   │
│ (prixFinal -    │              │                         │
│  prixMin)       │              │                         │
└────────┬────────┘              └────────────┬────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    MISSION EN COURS                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  DOUBLE CONFIRMATION (CLIENT + WORKER)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  LIBÉRATION ESCROW                           │
│ ┌──────────────────┐   ┌────────────────────┐              │
│ │ Worker: 90%      │   │ Commission: 10%    │              │
│ └──────────────────┘   └────────────────────┘              │
│ status = COMPLETED                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Annexe : Routes API Résumées

### Authentication

| Méthode | Route                | Accès  | Description     |
| ------- | -------------------- | ------ | --------------- |
| POST    | `/api/auth/register` | Public | Inscription     |
| POST    | `/api/auth/login`    | Public | Connexion       |
| GET     | `/api/auth/me`       | Auth   | Profil connecté |

### Workers

| Méthode | Route                        | Accès  | Description         |
| ------- | ---------------------------- | ------ | ------------------- |
| GET     | `/api/workers/public`        | Public | Liste workers       |
| GET     | `/api/workers/{id}/services` | Public | Services worker     |
| GET     | `/api/workers/me`            | WORKER | Mon profil          |
| PUT     | `/api/workers/me`            | WORKER | Modifier profil     |
| GET     | `/api/workers/me/missions`   | WORKER | Mes missions        |
| PATCH   | `/api/workers/me/reapply`    | WORKER | Reapply après rejet |

### Services

| Méthode | Route                | Accès  | Description       |
| ------- | -------------------- | ------ | ----------------- |
| GET     | `/api/services`      | Public | Liste services    |
| POST    | `/api/services`      | WORKER | Créer service     |
| PUT     | `/api/services/{id}` | WORKER | Modifier service  |
| DELETE  | `/api/services/{id}` | WORKER | Supprimer service |

### Missions

| Méthode | Route                                | Accès  | Description     |
| ------- | ------------------------------------ | ------ | --------------- |
| POST    | `/api/missions`                      | CLIENT | Créer mission   |
| GET     | `/api/missions`                      | Auth   | Liste missions  |
| GET     | `/api/missions/{id}`                 | Auth   | Détails mission |
| POST    | `/api/missions/{id}/accept`          | WORKER | Accepter        |
| POST    | `/api/missions/{id}/refuse`          | WORKER | Refuser         |
| POST    | `/api/missions/{id}/set-final-price` | WORKER | Prix final      |
| POST    | `/api/missions/{id}/start`           | WORKER | Démarrer        |
| POST    | `/api/missions/{id}/complete`        | Auth   | Terminer        |
| POST    | `/api/missions/{id}/cancel`          | Auth   | Annuler         |

### Paiements

| Méthode | Route                        | Accès  | Description    |
| ------- | ---------------------------- | ------ | -------------- |
| POST    | `/api/payments`              | CLIENT | Créer paiement |
| POST    | `/api/payments/callback`     | Public | Webhook        |
| POST    | `/api/payments/{id}/release` | Auth   | Libérer        |
| POST    | `/api/payments/{id}/cancel`  | Auth   | Annuler        |

### Litiges

| Méthode | Route                        | Accès | Description   |
| ------- | ---------------------------- | ----- | ------------- |
| POST    | `/api/disputes`              | Auth  | Créer litige  |
| GET     | `/api/disputes`              | Auth  | Liste litiges |
| POST    | `/api/disputes/{id}/resolve` | ADMIN | Résoudre      |

### Avis

| Méthode | Route                               | Accès  | Description |
| ------- | ----------------------------------- | ------ | ----------- |
| POST    | `/api/reviews`                      | CLIENT | Créer avis  |
| GET     | `/api/reviews/workers/{id}/reviews` | Public | Avis worker |

### Dashboard

| Méthode | Route                   | Accès  | Description  |
| ------- | ----------------------- | ------ | ------------ |
| GET     | `/api/dashboard/admin`  | ADMIN  | Stats admin  |
| GET     | `/api/dashboard/worker` | WORKER | Stats worker |
| GET     | `/api/dashboard/client` | CLIENT | Stats client |

### Admin

| Méthode | Route                             | Accès | Description   |
| ------- | --------------------------------- | ----- | ------------- |
| GET     | `/api/admin/workers`              | ADMIN | Liste workers |
| PATCH   | `/api/admin/workers/{id}/approve` | ADMIN | Approuver     |
| PATCH   | `/api/admin/workers/{id}/reject`  | ADMIN | Rejeter       |

---

_Document généré automatiquement pour SamaOuvrier Backend_
