# SamaOuvrier Backend - Documentation Technique

> Plateforme de mise en relation entre clients et prestataires de services au Sénégal

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-25+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22+-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI3-85EA2D?style=flat-square&logo=swagger)](https://swagger.io/)

---

## Table des Matières

1. [Présentation du Projet](#1-présentation-du-projet)
2. [Stack Technique](#2-stack-technique)
3. [Architecture du Projet](#3-architecture-du-projet)
4. [Modules Existants](#4-modules-existants)
5. [Gestion des Rôles et Autorisation](#5-gestion-des-rôles-et-autorisation)
6. [Format Standard des Réponses API](#6-format-standard-des-réponses-api)
7. [Gestion des Erreurs](#7-gestion-des-erreurs)
8. [Base de Données](#8-base-de-données)
9. [Documentation API](#9-documentation-api)
10. [Installation et Lancement](#10-installation-et-lancement)
11. [Structure Complète du Projet](#11-structure-complète-du-projet)
12. [Améliorations Futures](#12-améliorations-futures)

---

## 1. Présentation du Projet

### 1.1 Description Générale

**SamaOuvrier** est une plateforme backend construite avec **Node.js**, **Express** et **TypeScript**, conçue pour mettre en relation des clients avec des prestataires de services (workers) au Sénégal. Le système implémente une architecture **Clean Architecture** pour garantir la maintenabilité, la testabilité et la séparation des préoccupations.

### 1.2 Objectif du Backend

Le backend SamaOuvrier a pour objectifs principaux :

- **Gestion des utilisateurs** : Inscription, connexion, gestion de profils pour trois types d'utilisateurs (CLIENT, WORKER, ADMIN)
- **Validation des travailleurs** : Système d'approbation/rejet des prestataires par les administrateurs
- **Gestion des services** : CRUD des services proposés par les workers
- **Gestion des professions** : Administration des catégories de métiers (plombier, electricien, etc.)
- **Sécurisation des accès** : Authentification JWT et autorisation basée sur les rôles

### 1.3 Cas d'Usage Principal

1. **Inscription d'un client** : Un client peut s'inscrire sur la plateforme sans validation
2. **Inscription d'un worker** : Un prestataire s'inscrit avec sa profession, son compte reste en attente jusqu'à approbation admin
3. **Connexion** : Les utilisateurs se connectent avec email/password et reçoivent un token JWT
4. **Publication de services** : Les workers approuvés peuvent publier leurs services avec tarifs
5. **Administration** : L'admin valide/rejette les demandes de workers et gère les professions

---

## 2. Stack Technique

### 2.1 Technologies Utilisées

| Technologie            | Version | Description                                |
| ---------------------- | ------- | ------------------------------------------ |
| **Node.js**            | 25+     | Environnement d'exécution JavaScript       |
| **Express**            | 5.2+    | Framework web minimal et flexible          |
| **TypeScript**         | 5.9+    | Typage statique pour JavaScript            |
| **Prisma**             | 5.22+   | ORM de nouvelle génération pour PostgreSQL |
| **PostgreSQL**         | 15+     | Base de données relationnelle (Neon)       |
| **Zod**                | 4.3+    | Validation de données schéma-first         |
| **JWT**                | 9.0+    | Authentification par tokens                |
| **Swagger**            | 6.2+    | Documentation API interactive              |
| **Bcrypt**             | 6.0+    | Hachage de mots de passe                   |
| **Pino**               | 10+     | Logging haute performance                  |
| **Express-rate-limit** | 8.2+    | Protection contre les abus                 |

### 2.2 Pourquoi Ces Choix ?

- **TypeScript** : Garantit la sécurité des types et facilite la maintenance sur le long terme
- **Prisma** : Type-safety complet avec auto-complétion, migrations fluides, excellent support PostgreSQL
- **Zod** : Validation runtime avec inférence de types depuis les schémas, compatible TypeScript
- **Clean Architecture** : Séparation stricte des couches pour faciliter les tests et l'évolution
- **JWT** : Standard industry pour l'authentification stateless

---

## 3. Architecture du Projet

### 3.1 Principe Clean Architecture

Le projet utilise une architecture en **couches inversées de dépendances** (Dependency Rule) :

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACE LAYER                          │
│         (Controllers, Routes, Express Router)              │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                        │
│               (Use Cases / Business Logic)                  │
├─────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                            │
│              (Entities, Interfaces, Types)                 │
├─────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                      │
│           (Prisma Repository, External Services)           │
└─────────────────────────────────────────────────────────────┘
```

**Règle d'or** : Les dépendances ne peuvent aller que de l'extérieur vers l'intérieur. Un use case ne connaît pas les controllers, un repository interface ne connaît pas Prisma.

### 3.2 Diagramme Textuel de l'Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        API CLIENTS                                  │
│                  (Postman, Frontend, Mobile)                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP Requests
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     🎯 INTERFACE LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ user.routes │  │auth.routes  │  │admin.routes │  ...           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │
│         │                │                │                         │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐                │
│  │UserController│ │AuthController│ │AdminController               │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │
└─────────┼────────────────┼────────────────┼─────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   📋 APPLICATION LAYER                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     USE CASES                                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │   │
│  │  │AddUser   │ │Login     │ │Approve   │ │Create    │       │   │
│  │  │Usecase   │ │Usecase   │ │Worker    │ │Service   │       │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      🏗️ DOMAIN LAYER                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    ENTITIES & INTERFACES                     │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │   │
│  │  │ UserEntity     │  │ ServiceEntity  │  │ProfessionEntity│  │   │
│  │  └────────────────┘  └────────────────┘  └────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │ IUserRepository │ IServiceRepository │ IAuthRepository│ │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   🔧 INFRASTRUCTURE LAYER                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    IMPLEMENTATIONS                          │   │
│  │  ┌──────────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │PrismaUserRepository │  │PrismaAuthRepository         │ │   │
│  │  └──────────────────────┘  └──────────────────────────────┘ │   │
│  │  ┌──────────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │PrismaServiceRepo    │  │PrismaProfessionRepository   │ │   │
│  │  └──────────────────────┘  └──────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    PRISMA ORM                               │   │
│  │                         ↓                                   │   │
│  │                   POSTGRESQL (Neon)                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Pourquoi Cette Architecture ?

| Avantage                          | Explication                                                    |
| --------------------------------- | -------------------------------------------------------------- |
| **Testabilité**                   | Chaque couche peut être testée indépendamment avec des mocks   |
| **Maintenabilité**                | Modification d'une couche sans impacter les autres             |
| **Réutilisabilité**               | Les use cases peuvent être utilisés par différents controllers |
| **Séparation des préoccupations** | La logique métier est isolée de l'infrastructure               |
| **Indépendance des frameworks**   | Le cœur métier ne dépend pas d'Express ou Prisma               |

---

## 4. Modules Existants

### 4.1 Module Auth (Authentication)

**Rôle** : Gérer l'authentification et l'inscription des utilisateurs

**Responsabilités** :

- Inscription (register) avec validation du type de compte
- Connexion (login) avec génération de token JWT
- Récupération du profil utilisateur connecté (me)

**Routes** :

| Méthode | Route                | Accès       | Description                     |
| ------- | -------------------- | ----------- | ------------------------------- |
| POST    | `/api/auth/register` | Public      | Inscription nouveau utilisateur |
| POST    | `/api/auth/login`    | Public      | Connexion utilisateur           |
| GET     | `/api/auth/me`       | Authentifié | Obtenir profil connecté         |

**Règles métier** :

- L'inscription ADMIN est interdite
- Pour WORKER : `professionId` est obligatoire
- Pour CLIENT : `professionId` ne doit pas être présent
- Les workers doivent avoir le statut `APPROVED` pour se connecter

**Use Cases** :

- [`RegisterUseCase`](src/modules/auth/application/register.usecase.ts) : Inscription avec validation
- [`LoginUseCase`](src/modules/auth/application/login.usecase.ts) : Authentification et génération JWT

---

### 4.2 Module User (Gestion des Utilisateurs)

**Rôle** : CRUD complet sur les utilisateurs (administration)

**Responsabilités** :

- Création d'utilisateurs (admin)
- Listing paginé des utilisateurs
- Récupération par ID
- Mise à jour
- Suppression

**Routes** :

| Méthode | Route            | Accès | Description                  |
| ------- | ---------------- | ----- | ---------------------------- |
| POST    | `/api/users`     | ADMIN | Créer utilisateur            |
| GET     | `/api/users`     | ADMIN | Lister utilisateurs (paginé) |
| GET     | `/api/users/:id` | ADMIN | Obtenir par ID               |
| PUT     | `/api/users/:id` | ADMIN | Modifier utilisateur         |
| DELETE  | `/api/users/:id` | ADMIN | Supprimer utilisateur        |

**Use Cases** :

- [`AddUserUseCase`](src/modules/user/application/add-user.usecase.ts)
- [`GetUsersUseCase`](src/modules/user/application/get-users.usecase.ts)
- [`GetUserByIdUseCase`](src/modules/user/application/get-user-by-id.usecase.ts)
- [`UpdateUserUseCase`](src/modules/user/application/update-user.usecase.ts)
- [`DeleteUserUseCase`](src/modules/user/application/delete-user.usecase.ts)

---

### 4.3 Module Service (Services des Workers)

**Rôle** : Gestion des services proposés par les prestataires

**Responsabilités** :

- Création de services avec fourchettes de prix
- Listing avec filtrage par worker
- Récupération par ID
- Mise à jour (propriétaire uniquement)
- Suppression (propriétaire uniquement)

**Routes** :

| Méthode | Route               | Accès        | Description     |
| ------- | ------------------- | ------------ | --------------- |
| POST    | `/api/services`     | WORKER       | Créer service   |
| GET     | `/api/services`     | Public       | Lister services |
| GET     | `/api/services/:id` | Public       | Obtenir par ID  |
| PUT     | `/api/services/:id` | Propriétaire | Modifier        |
| DELETE  | `/api/services/:id` | Propriétaire | Supprimer       |

**Règles métier** :

- Un worker ne peut pas avoir deux services avec le même titre
- La mise à jour/suppression n'est possible que par le propriétaire

**Use Cases** :

- [`AddServiceUseCase`](src/modules/service/application/add-service.usecase.ts)
- [`GetServicesUseCase`](src/modules/service/application/get-services.usecase.ts)
- [`GetServiceByIdUseCase`](src/modules/service/application/get-service-by-id.usecase.ts)
- [`UpdateServiceUseCase`](src/modules/service/application/update-service.usecase.ts)
- [`DeleteServiceUseCase`](src/modules/service/application/delete-service.usecase.ts)

---

### 4.4 Module Profession (Métiers)

**Rôle** : Administration des catégories de métiers

**Responsabilités** :

- Création de nouvelles professions (admin)
- Listing public des professions
- Mise à jour (admin)
- Suppression (admin)

**Routes** :

| Méthode | Route                  | Accès  | Description        |
| ------- | ---------------------- | ------ | ------------------ |
| POST    | `/api/professions`     | ADMIN  | Créer profession   |
| GET     | `/api/professions`     | Public | Lister professions |
| PATCH   | `/api/professions/:id` | ADMIN  | Modifier           |
| DELETE  | `/api/professions/:id` | ADMIN  | Supprimer          |

**Use Cases** :

- [`CreateProfessionUseCase`](src/modules/profession/application/create-profession.usecase.ts)
- [`ListProfessionsUseCase`](src/modules/profession/application/list-professions.usecase.ts)
- [`UpdateProfessionUseCase`](src/modules/profession/application/update-profession.usecase.ts)
- [`DeleteProfessionUseCase`](src/modules/profession/application/delete-profession.usecase.ts)

---

### 4.5 Module Admin (Administration)

**Rôle** : Validation des comptes workers par les administrateurs

**Responsabilités** :

- Listing des workers avec filtre par statut
- Approbation d'un worker en attente
- Rejet d'un worker avec reason

**Routes** :

| Méthode | Route                            | Accès | Description                  |
| ------- | -------------------------------- | ----- | ---------------------------- |
| GET     | `/api/admin/workers`             | ADMIN | Lister workers (avec filtre) |
| PATCH   | `/api/admin/workers/:id/approve` | ADMIN | Approuver worker             |
| PATCH   | `/api/admin/workers/:id/reject`  | ADMIN | Rejeter worker               |

**Règles métier** :

- Seul un ADMIN peut exécuter ces actions
- Un worker ne peut être approuvé que s'il est en statut `PENDING`
- Un worker ne peut être rejeté que s'il est en statut `PENDING`
- La reason de rejet est obligatoire

**Use Cases** :

- [`ListWorkersUseCase`](src/modules/admin/application/list-workers.usecase.ts)
- [`ApproveWorkerUseCase`](src/modules/admin/application/approve-worker.usecase.ts)
- [`RejectWorkerUseCase`](src/modules/admin/application/reject-worker.usecase.ts)

---

### 4.6 Module Worker (Espace Travailleur)

**Rôle** : Actions spécifiques aux prestataires

**Responsabilités** :

- Refaire une demande de validation après rejet

**Routes** :

| Méthode | Route                     | Accès  | Description     |
| ------- | ------------------------- | ------ | --------------- |
| PATCH   | `/api/workers/me/reapply` | WORKER | Refaire demande |

**Règles métier** :

- Seul un WORKER peut effectuer cette action
- Le worker doit être en statut `REJECTED`
- Le statut passe à `PENDING` après la demande

**Use Cases** :

- [`ReapplyWorkerUseCase`](src/modules/worker/application/reapply-worker.usecase.ts)

---

## 5. Gestion des Rôles et Autorisation

### 5.1 Les Rôles Utilisateurs

Le système définit trois rôles via l'enum Prisma [`Role`](prisma/schema.prisma:18) :

| Rôle       | Description                   | Accès                     |
| ---------- | ----------------------------- | ------------------------- |
| **CLIENT** | Client cherchant des services | Routes publiques + profil |
| **WORKER** | Prestataire de services       | Routes worker + services  |
| **ADMIN**  | Administrateur                | Toutes les routes admin   |

### 5.2 Statut du Travailleur

Les workers ont un statut secondaire via l'enum [`WorkerStatus`](prisma/schema.prisma:26) :

| Statut       | Signification            | Accès                                      |
| ------------ | ------------------------ | ------------------------------------------ |
| **PENDING**  | En attente de validation | Connexion bloquée                          |
| **APPROVED** | Validé par l'admin       | Accès complet                              |
| **REJECTED** | Rejeté par l'admin       | Connexion bloquée + possibilité de reapply |

### 5.3 Authentification - `authenticate()`

Le middleware [`authenticate()`](src/shared/middleware/authenticate.middleware.ts:40) vérifie le token JWT :

```typescript
// Utilisation dans les routes
router.get("/profile", authenticate(), controller.getProfile);
```

**Fonctionnement** :

1. Extrait le header `Authorization: Bearer <token>`
2. Vérifie le token avec `jwt.verify()`
3. Injecte les données utilisateur dans `req.user`
4. Retourne 401 si token manquant/invalide

**Sécurité** :

- Le rôle est TOUJOURS lu depuis le token vérifié, jamais du client
- Les tokens expirés sont détectés et génèrent une erreur 401

### 5.4 Autorisation - `authorize()`

Le middleware [`authorize()`](src/shared/middleware/authorize.middleware.ts:21) vérifie les rôles :

```typescript
// Usage simple
router.delete(
  "/users/:id",
  authenticate(),
  authorize(Role.ADMIN),
  controller.delete,
);

// Usage multi-rôles
router.get(
  "/stats",
  authenticate(),
  authorize(Role.ADMIN, Role.WORKER),
  controller.stats,
);
```

**Fonctionnement** :

1. Vérifie que `req.user` existe (authentification préalable)
2. Compare le rôle utilisateur avec les rôles autorisés
3. Retourne 403 si accès refusé

---

## 6. Format Standard des Réponses API

Toutes les réponses suivent un format JSON standardisé :

### 6.1 Réponse de Succès

```typescript
{
  success: true,
  message: "Opération réussie",
  data?: any
}
```

**Exemples** :

```json
// 200 OK - GET
{
  "success": true,
  "message": "Utilisateurs récupérés avec succès.",
  "data": {
    "users": [...],
    "pagination": { "page": 1, "limit": 10, "total": 25 }
  }
}

// 201 Created - POST
{
  "success": true,
  "message": "Inscription effectuée avec succès.",
  "data": {
    "user": { "id": "...", "email": "...", "role": "CLIENT" },
    "token": "eyJhbGci..."
  }
}
```

### 6.2 Réponse d'Erreur

```typescript
{
  success: false,
  message: "Message d'erreur en français",
  code?: string,
  errors?: Record<string, unknown>
}
```

**Exemples** :

```json
// 400 Bad Request - Validation
{
  "success": false,
  "message": "Les données fournies ne sont pas valides.",
  "code": "VALIDATION_ERROR",
  "errors": { "email": "Format d'email invalide" }
}

// 401 Unauthorized
{
  "success": false,
  "message": "Authentification échouée",
  "code": "UNAUTHORIZED"
}

// 403 Forbidden
{
  "success": false,
  "message": "Permissions insuffisantes",
  "code": "FORBIDDEN"
}

// 404 Not Found
{
  "success": false,
  "message": "Utilisateur introuvable.",
  "code": "RESOURCE_NOT_FOUND"
}

// 409 Conflict
{
  "success": false,
  "message": "Cette adresse email est déjà utilisée.",
  "code": "AUTH_EMAIL_EXISTS"
}
```

### 6.3 Helpers de Réponse

Le projet fournit des helpers dans [`api-response.ts`](src/shared/utils/api-response.ts) :

```typescript
// Succès
sendSuccess(res, "Message", data);
sendCreated(res, "Créé avec succès", data);

// Erreurs
sendError(res, "Erreur", 400);
sendUnauthorized(res);
sendForbidden(res);
sendNotFound(res);
sendConflict(res, "Conflit");
```

---

## 7. Gestion des Erreurs

### 7.1 Architecture de la Gestion d'Erreurs

Le système utilise une approche centralisée avec le middleware [`errorHandler`](src/shared/middleware/errorHandler.middleware.ts:40) :

```
Requête → Middleware → Controller → UseCase → Repository → Base de données
                                    ↓
                              Erreur?
                                    ↓
                         errorHandler global
                                    ↓
                         Réponse JSON standardisée
```

### 7.2 Types d'Erreurs Gérées

| Type d'erreur       | Source            | Comportement                                    |
| ------------------- | ----------------- | ----------------------------------------------- |
| **BusinessError**   | Logique métier    | Message exposé, code HTTP custom                |
| **ZodError**        | Validation entrée | Details des champs invalides                    |
| **PrismaError**     | Base de données   | Messages traduits, jamais de détails techniques |
| **JWTError**        | Authentification  | Message adapté (expiré/invalide)                |
| **Erreur inconnue** | Inattendue        | Message générique en prod, détails en dev       |

### 7.3 BusinessError

La classe [`BusinessError`](src/shared/errors/business-error.ts:40) permet de créer des erreurs métier cohérentes :

```typescript
throw new BusinessError({
  message: "Email déjà utilisé",
  statusCode: 409,
  code: "AUTH_EMAIL_EXISTS",
});
```

**Factory shortcuts** :

```typescript
BusinessErrors.notFound("Utilisateur introuvable");
BusinessErrors.unauthorized("Accès refusé");
BusinessErrors.forbidden("Permissions insuffisantes");
BusinessErrors.conflict("Ressource existante");
```

### 7.4 AsyncHandler

Le wrapper [`asyncHandler`](src/shared/utils/api-response.ts:20) capture les promesses rejections :

```typescript
// AVEC asyncHandler - Les erreurs sont catchées automatiquement
router.get("/users", asyncHandler(controller.getAll));

// SINON - Risque de hanging request si erreur non catchée
router.get("/users", controller.getAll); // Danger!
```

### 7.5 Codes HTTP Utilisés

| Code | Signification  | Usage                    |
| ---- | -------------- | ------------------------ |
| 200  | OK             | Requêtes réussies        |
| 201  | Created        | Ressources créées        |
| 400  | Bad Request    | Validation échouée       |
| 401  | Unauthorized   | Token manquant/invalide  |
| 403  | Forbidden      | Rôle insuffisant         |
| 404  | Not Found      | Ressource inexistante    |
| 409  | Conflict       | Contrainte unique violée |
| 500  | Internal Error | Erreur serveur           |

---

## 8. Base de Données

### 8.1 Modèle de Données Prisma

Le schéma est défini dans [`schema.prisma`](prisma/schema.prisma) :

```prisma
// Enum des rôles
enum Role {
  ADMIN  @map("admin")
  CLIENT @map("client")
  WORKER @map("worker")
}

// Enum des statuts worker
enum WorkerStatus {
  PENDING  @map("pending")
  APPROVED @map("approved")
  REJECTED @map("rejected")
}

// Profession (catégorie de métier)
model Profession {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  users       User[]   // Relation inverse
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Utilisateur principal
model User {
  id              String        @id @default(uuid())
  nom             String
  prenom          String
  adresse         String
  tel             String
  email           String        @unique
  password        String

  role            Role          @default(CLIENT)
  workerStatus    WorkerStatus? // Pour les workers
  rejectionReason String?       // Si rejeté

  professionId    String?
  profession      Profession?   @relation(...)

  services        Service[]     // Services proposés
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([role, email, workerStatus])
}

// Service proposé par un worker
model Service {
  id          String   @id @default(uuid())
  title       String
  description String
  minPrice    Decimal
  maxPrice    Decimal

  workerId    String
  worker      User     @relation(fields: [workerId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([workerId, title]) // Un titre par worker
}
```

### 8.2 Relations Principales

```
Profession (1) ──── (N) User
                         │
                         └── (N) Service
```

- **Profession → User** : One-to-Many (une profession peut avoir plusieurs workers)
- **User → Service** : One-to-Many (un worker peut proposer plusieurs services)

### 8.3 Commandes Prisma Utilisées

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer une migration
npm run prisma:migrate

# Ouvrir Prisma Studio (interface visuelle)
npm run prisma:studio

# Seed la base de données
npm run prisma:seed
```

### 8.4 Configuration Environment

Le fichier [`.env`](.env) contient :

```env
DATABASE_URL="postgresql://..."
PORT=3000
JWT_SECRET="votre-secret-min-32-caractères"
JWT_EXPIRES_IN="7d"
```

---

## 9. Documentation API

### 9.1 Swagger UI

Le projet intègre **Swagger UI** pour une documentation interactive.

**URL d'accès** : `http://localhost:3000/api-docs`

### 9.2 Fonctionnalités

- Documentation interactive des endpoints
- Test direct des requêtes depuis le navigateur
- Schémas de requêtes/réponses documentés
- Authentification intégrée (bouton Authorize)
- Codes de réponse documentés

### 9.3 Configuration

La configuration se trouve dans [`swagger.config.ts`](src/shared/config/swagger.config.ts) et [`swagger.setup.ts`](src/shared/config/swagger.setup.ts).

### 9.4 Tags Swagger

| Tag                              | Description               |
| -------------------------------- | ------------------------- |
| Authentification                 | Login, register, profile  |
| Utilisateurs                     | CRUD utilisateurs (admin) |
| Professions                      | Gestion métiers (admin)   |
| Services                         | Services des workers      |
| Admin - Gestion des travailleurs | Approbation/rejet workers |
| Worker - Gestion du compte       | Actions worker            |

---

## 10. Installation et Lancement

### 10.1 Prérequis

- Node.js 25+
- PostgreSQL (local ou Neon)
- npm ou yarn

### 10.2 Installation

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd SamaOuvrierBackEnd

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Modifier .env avec vos valeurs
```

### 10.3 Configuration .env

```env
# Base de données (obligatoire)
DATABASE_URL="postgresql://user:password@localhost:5432/samaouvrier"

# Serveur
PORT=3000

# JWT (min 32 caractères en production)
JWT_SECRET="votre-super-secret-jwt-key-très-longue"
JWT_EXPIRES_IN="7d"

# Options avancées (valeurs par défaut)
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 10.4 Lancer le Projet

```bash
# Mode développement (avec hot-reload)
npm run dev

# Mode production
npm run build
npm start
```

Le serveur démarre sur `http://localhost:3000`

### 10.5 Commandes NPM Importantes

| Commande                  | Description                  |
| ------------------------- | ---------------------------- |
| `npm run dev`             | Lancer en mode développement |
| `npm run build`           | Compiler TypeScript          |
| `npm run start`           | Lancer version compilée      |
| `npm run prisma:generate` | Générer client Prisma        |
| `npm run prisma:migrate`  | Appliquer migrations         |
| `npm run prisma:studio`   | Interface Prisma             |
| `npm run prisma:seed`     | Seed base de données         |

### 10.6 Accès aux Endpoints

| Service | URL                              |
| ------- | -------------------------------- |
| API     | `http://localhost:3000/api`      |
| Swagger | `http://localhost:3000/api-docs` |
| Health  | `http://localhost:3000/health`   |

---

## 11. Structure Complète du Projet

```
SamaOuvrierBackEnd/
├── .env                          # Variables d'environnement
├── .gitignore                    # Fichiers ignorés par git
├── package.json                  # Dépendances et scripts
├── tsconfig.json                 # Configuration TypeScript
│
├── prisma/
│   ├── schema.prisma             # Schéma de base de données
│   ├── seed.ts                  # Script de seed
│   └── migrations/              # Migrations Prisma
│
└── src/
    ├── app.ts                   # Configuration Express
    ├── server.ts                # Point d'entrée
    │
    ├── modules/                 # Modules par fonctionnalité
    │   ├── auth/               # Authentication
    │   │   ├── application/     # Use cases
    │   │   │   ├── register.usecase.ts
    │   │   │   └── login.usecase.ts
    │   │   ├── domain/         # Types domain
    │   │   ├── infrastructure/ # Repository Prisma
    │   │   ├── interface/      # Controller + Routes
    │   │   └── auth.service.ts
    │   │
    │   ├── user/               # Gestion utilisateurs
    │   │   ├── application/    # Use cases (CRUD)
    │   │   ├── domain/         # Entité + interfaces
    │   │   ├── infrastructure # Repository Prisma
    │   │   └── interface/      # Controller + Routes
    │   │
    │   ├── service/            # Services workers
    │   │   ├── application/
    │   │   ├── domain/
    │   │   ├── infrastructure/
    │   │   └── interface/
    │   │
    │   ├── profession/         # Métiers
    │   │   ├── application/
    │   │   ├── domain/
    │   │   ├── infrastructure/
    │   │   └── interface/
    │   │
    │   ├── admin/              # Administration
    │   │   ├── application/    # Use cases (approve/reject)
    │   │   └── interface/       # Controller + Routes
    │   │
    │   └── worker/             # Espace worker
    │       ├── application/    # Use cases (reapply)
    │       └── interface/       # Routes
    │
    └── shared/                 # Code partagé
        ├── config/             # Configuration
        │   ├── config.ts       # Variables d'env
        │   ├── swagger.config.ts
        │   └── swagger.setup.ts
        │
        ├── constants/         # Constantes
        │   └── messages.ts    # Tous les messages
        │
        ├── errors/             # Classes d'erreurs
        │   └── business-error.ts
        │
        ├── middleware/        # Middlewares Express
        │   ├── authenticate.middleware.ts
        │   ├── authorize.middleware.ts
        │   └── errorHandler.middleware.ts
        │
        ├── database/          # Connexion Prisma
        │   └── prisma.client.ts
        │
        └── utils/            # Utilitaires
            └── api-response.ts
```

### 11.1 Explication des Dossiers

| Dossier                     | Rôle                                         |
| --------------------------- | -------------------------------------------- |
| `modules/`                  | Chaque fonctionnalité est un module autonome |
| `modules/X/application/`    | Logique métier pure (use cases)              |
| `modules/X/domain/`         | Entités et interfaces (abstractions)         |
| `modules/X/infrastructure/` | Implémentations concrètes (Prisma)           |
| `modules/X/interface/`      | HTTP (controllers, routes)                   |
| `shared/`                   | Code réutilisé par plusieurs modules         |
| `shared/middleware/`        | Filtres HTTP (auth, errors)                  |
| `shared/config/`            | Configuration centraleisée                   |
| `shared/constants/`         | Messages, codes HTTP                         |

---

## 12. Améliorations Futures

### 12.1 Fonctionnalités Potentielles

- **Système de messaging** : Chat entre clients et workers
- **Paiements** : Intégration Stripe ou Wave
- **Notes et évaluations** : Système de reviews
- **Notifications** : Push notifications pour nouveaux services
- **Recherche avancée** : Filtrage par localisation, prix, note
- **Dashboard analytics** : Statistiques pour l'admin

### 12.2 Améliorations Techniques

| Amélioration           | Bénéfice                                      |
| ---------------------- | --------------------------------------------- |
| **Cache Redis**        | Performance sur données fréquemment requêtées |
| **Microservices**      | Scalabilité horizontale                       |
| **GraphQL**            | Flexibilité pour les clients mobiles          |
| **CQRS**               | Séparation lecture/écriture                   |
| **Events**             | Découplage avec Event-Driven Architecture     |
| **GraphQL Federation** | Architecture distribuée                       |
| **CI/CD**              | Déploiement automatisé                        |
| **Tests E2E**          | Couverture fonctionnelle complète             |

### 12.3 Sécurité Avancée

- Rate limiting par utilisateur
- Double authentification (2FA)
- Logging d'audit
- Chiffrement des données sensibles
- Protection CSRF
- Headers de sécurité (Helmet)

---

## License

Propriétaire - SamaOuvrier

---

_Document généré automatiquement - Dernière mise à jour : 2026_
