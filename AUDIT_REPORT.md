# 🔍 AUDIT TECHNIQUE BACKEND - SamaOuvrierBackEnd

**Date de l'audit:** 26 février 2026  
**Auditeur:** Analyse automatique  
**Version:** 1.0  
**Technologies:** Express + TypeScript + Prisma (PostgreSQL) + Clean Architecture

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Liste complète des routes](#2-liste-complète-des-routes)
3. [Tableau récapitulatif des permissions](#3-tableau-récapitulatif-des-permissions)
4. [Analyse des règles métier](#4-analyse-des-règles-métier)
5. [Scénarios de test critiques](#5-scénarios-de-test-critiques)
6. [Incohérences et failles identifiées](#6-incohérences-et-failles-identifiées)
7. [Corrections proposées](#7-corrections-proposées)
8. [Recommandations générales](#8-recommandations-générales)
9. [Conclusion](#9-conclusion)

---

## 1. VUE D'ENSEMBLE

### 1.1 Architecture du projet

Le projet suit les principes du **Clean Architecture** avec une séparation claire en couches :

```
src/
├── modules/              # Modules fonctionnels
│   ├── admin/           # Gestion administrative
│   ├── auth/            # Authentification
│   ├── profession/      # Professions
│   ├── service/         # Services
│   ├── user/            # Gestion utilisateurs
│   └── worker/          # Gestion travailleurs
├── shared/              # Code partagé
│   ├── middleware/      # Middlewares (auth, authorize, blockBannedUser)
│   ├── security/        # Services (Password)
│   ├── config/         # Configuration
│   ├── constants/      # Messages et codes d'erreur
│   └── errors/         # Gestion d'erreurs
```

### 1.2 Structure de la base de données

**Modèles principaux :**

- **User** : `id`, `nom`, `prenom`, `adresse`, `tel`, `email`, `password`, `role` (ADMIN|CLIENT|WORKER), `workerStatus` (PENDING|APPROVED|REJECTED), `professionId`, `isActive`, `isBanned`, `deletedAt`, `createdAt`, `updatedAt`
- **Profession** : `id`, `name`, `description`
- **Service** : `id`, `title`, `description`, `minPrice`, `maxPrice`, `workerId`

### 1.3 Champs de statut utilisateur

| Champ       | Type      | Description             | Valeur par défaut |
| ----------- | --------- | ----------------------- | ----------------- |
| `isActive`  | Boolean   | Compte activé/désactivé | true              |
| `isBanned`  | Boolean   | Compte banni            | false             |
| `deletedAt` | DateTime? | Soft delete             | null              |

---

## 2. LISTE COMPLÈTE DES ROUTES

### 2.1 Routes d'authentification (`/api/auth`)

| Méthode | Route            | Middleware | Description               |
| ------- | ---------------- | ---------- | ------------------------- |
| POST    | `/auth/register` | ❌ Aucun   | Inscription CLIENT/WORKER |
| POST    | `/auth/login`    | ❌ Aucun   | Connexion utilisateur     |

### 2.2 Routes utilisateurs (`/api/users`)

| Méthode | Route                   | Middleware               | Rôle requis         | Description                       |
| ------- | ----------------------- | ------------------------ | ------------------- | --------------------------------- |
| POST    | `/users`                | authenticate + authorize | ADMIN               | Créer un utilisateur              |
| GET     | `/users`                | authenticate + authorize | ADMIN               | Liste des utilisateurs            |
| GET     | `/users/:id`            | authenticate + authorize | ADMIN               | Obtenir un utilisateur            |
| PUT     | `/users/:id`            | authenticate + authorize | ADMIN               | Modifier un utilisateur           |
| DELETE  | `/users/:id`            | authenticate + authorize | ADMIN               | Supprimer (hard delete)           |
| PATCH   | `/users/me/activation`  | authenticate             | Utilisateur himself | Activer/désactiver son compte     |
| PATCH   | `/users/:id/activation` | authenticate + authorize | ADMIN               | Activer/désactiver un utilisateur |
| PATCH   | `/users/:id/ban`        | authenticate + authorize | ADMIN               | Bannir/débannir un utilisateur    |
| DELETE  | `/users/:id`            | authenticate + authorize | ADMIN               | Soft delete un utilisateur        |

### 2.3 Routes admin (`/api/admin`)

| Méthode | Route                         | Middleware               | Rôle requis | Description                |
| ------- | ----------------------------- | ------------------------ | ----------- | -------------------------- |
| GET     | `/admin/workers`              | authenticate + authorize | ADMIN       | Liste des travailleurs     |
| PATCH   | `/admin/workers/:id/approve`  | authenticate + authorize | ADMIN       | Approuver un travailleur   |
| PATCH   | `/admin/workers/:id/reject`   | authenticate + authorize | ADMIN       | Rejeter un travailleur     |
| PATCH   | `/admin/users/:id/activate`   | authenticate + authorize | ADMIN       | Activer un utilisateur     |
| PATCH   | `/admin/users/:id/deactivate` | authenticate + authorize | ADMIN       | Désactiver un utilisateur  |
| PATCH   | `/admin/users/:id/ban`        | authenticate + authorize | ADMIN       | Bannir un utilisateur      |
| PATCH   | `/admin/users/:id/unban`      | authenticate + authorize | ADMIN       | Débannir un utilisateur    |
| DELETE  | `/admin/users/:id`            | authenticate + authorize | ADMIN       | Soft delete un utilisateur |
| PATCH   | `/admin/users/:id/restore`    | authenticate + authorize | ADMIN       | Restaurer un utilisateur   |

### 2.4 Routes services (`/api/services`)

| Méthode | Route           | Middleware  | Rôle requis | Description                 |
| ------- | --------------- | ----------- | ----------- | --------------------------- |
| POST    | `/services`     | ❌ Aucun ⚠️ | -           | Créer un service            |
| GET     | `/services`     | ❌ Aucun    | -           | Liste des services (PUBLIC) |
| GET     | `/services/:id` | ❌ Aucun    | -           | Obtenir un service (PUBLIC) |
| PUT     | `/services/:id` | ❌ Aucun ⚠️ | -           | Modifier un service         |
| DELETE  | `/services/:id` | ❌ Aucun ⚠️ | -           | Supprimer un service        |

### 2.5 Routes professions (`/api/professions`)

| Méthode | Route              | Middleware               | Rôle requis | Description                    |
| ------- | ------------------ | ------------------------ | ----------- | ------------------------------ |
| POST    | `/professions`     | authenticate + authorize | ADMIN       | Créer une profession           |
| GET     | `/professions`     | ❌ Aucun                 | -           | Liste des professions (PUBLIC) |
| PATCH   | `/professions/:id` | authenticate + authorize | ADMIN       | Modifier une profession        |
| DELETE  | `/professions/:id` | authenticate + authorize | ADMIN       | Supprimer une profession       |

### 2.6 Routes worker (`/api/workers`)

| Méthode | Route                 | Middleware               | Rôle requis | Description                       |
| ------- | --------------------- | ------------------------ | ----------- | --------------------------------- |
| PATCH   | `/workers/me/reapply` | authenticate + authorize | WORKER      | Refaire une demande de validation |

---

## 3. TABLEAU RÉCAPITULATIF DES PERMISSIONS

### 3.1 Tableau croisé Routes × Permissions

| Route                        | Auth | ADMIN | CLIENT | WORKER | Banned   | Deleted  | Inactive |
| ---------------------------- | ---- | ----- | ------ | ------ | -------- | -------- | -------- |
| `POST /auth/register`        | ❌   | ❌    | ✅     | ✅     | ✅       | ✅       | ✅       |
| `POST /auth/login`           | ❌   | ✅    | ✅     | ✅     | ❌ (403) | ❌ (403) | ✅       |
| `GET /services`              | ❌   | ✅    | ✅     | ✅     | ✅       | ✅       | ✅       |
| `GET /professions`           | ❌   | ✅    | ✅     | ✅     | ✅       | ✅       | ✅       |
| `POST /services`             | ❌   | ⚠️    | ⚠️     | ⚠️     | ⚠️       | ⚠️       | ⚠️       |
| `POST /users`                | ✅   | ✅    | ❌     | ❌     | N/A      | N/A      | N/A      |
| `PATCH /users/me/activation` | ✅   | ✅    | ✅     | ✅     | ❌ (403) | N/A      | ✅       |
| `PATCH /admin/users/:id/*`   | ✅   | ✅    | ❌     | ❌     | N/A      | ❌ (400) | ✅       |
| `PATCH /workers/me/reapply`  | ✅   | ❌    | ❌     | ✅     | ❌       | ✅       | ❌       |

### 3.2 Légende

- ✅ = Autorisé
- ❌ = Refusé
- ⚠️ = Danger (pas de vérification)
- N/A = Non applicable

---

## 4. ANALYSE DES RÈGLES MÉTIER

### 4.1 Règles de LOGIN

✅ **Vérifié dans [`login.usecase.ts:178-187`](src/modules/auth/application/login.usecase.ts:178)**

| Condition           | Comportement              | Code                    |
| ------------------- | ------------------------- | ----------------------- |
| `isBanned = true`   | ❌ Refuse connexion (403) | `UserBannedLoginError`  |
| `deletedAt != null` | ❌ Refuse connexion (403) | `UserDeletedLoginError` |
| `isActive = false`  | ✅ Permet connexion       | -                       |

### 4.2 Règles d'ACTIVATION

✅ **Vérifié dans [`toggle-own-activation.usecase.ts`](src/modules/user/application/toggle-own-activation.usecase.ts)**

| Action                            | Admin       | User himself | User banni        | User supprimé |
| --------------------------------- | ----------- | ------------ | ----------------- | ------------- |
| Activer/désactiver son compte     | N/A         | ✅ Autorisé  | ❌ Interdit (403) | ❌ Interdit   |
| Admin active/désactive autre user | ✅ Autorisé | N/A          | ✅ Autorisé       | ❌ Interdit   |

### 4.3 Règles de BAN

✅ **Vérifié dans [`toggle-user-ban.usecase.ts`](src/modules/user/application/toggle-user-ban.usecase.ts)**

| Action                  | ADMIN       | CLIENT      | WORKER      |
| ----------------------- | ----------- | ----------- | ----------- |
| Bannir un utilisateur   | ✅ Autorisé | ❌ Interdit | ❌ Interdit |
| Débannir un utilisateur | ✅ Autorisé | ❌ Interdit | ❌ Interdit |

### 4.4 Règles de SOFT DELETE

✅ **Vérifié dans [`soft-delete-user.usecase.ts`](src/modules/user/application/soft-delete-user.usecase.ts)**

| Action                     | ADMIN       | CLIENT      | WORKER      |
| -------------------------- | ----------- | ----------- | ----------- |
| Soft delete un utilisateur | ✅ Autorisé | ❌ Interdit | ❌ Interdit |
| Restaurer un utilisateur   | ✅ Autorisé | ❌ Interdit | ❌ Interdit |

---

## 5. SCÉNARIOS DE TEST CRITIQUES

### 5.1 Tests de LOGIN

| #   | Scénario                        | Résultat attendu | Résultat réel |
| --- | ------------------------------- | ---------------- | ------------- |
| 1   | Login avec utilisateur ACTIF    | ✅ Succès (200)  | ✅ OK         |
| 2   | Login avec utilisateur INACTIF  | ✅ Succès (200)  | ✅ OK         |
| 3   | Login avec utilisateur BANNI    | ❌ Erreur (403)  | ✅ OK         |
| 4   | Login avec utilisateur SUPPRIMÉ | ❌ Erreur (403)  | ✅ OK         |
| 5   | Login avec worker PENDING       | ❌ Erreur (403)  | ✅ OK         |
| 6   | Login avec worker REJECTED      | ❌ Erreur (403)  | ✅ OK         |
| 7   | Login avec worker APPROVED      | ✅ Succès (200)  | ✅ OK         |

### 5.2 Tests d'ACTIVATION

| #   | Scénario                                         | Résultat attendu | Résultat réel |
| --- | ------------------------------------------------ | ---------------- | ------------- |
| 8   | User active son propre compte                    | ✅ Succès        | ✅ OK         |
| 9   | User désactive son propre compte                 | ✅ Succès        | ✅ OK         |
| 10  | User banni essaie d'activer son compte           | ❌ 403           | ✅ OK         |
| 11  | Admin active un utilisateur                      | ✅ Succès        | ✅ OK         |
| 12  | Admin désactive un utilisateur                   | ✅ Succès        | ✅ OK         |
| 13  | Admin essaie de modifier un utilisateur supprimé | ❌ 400           | ✅ OK         |

### 5.3 Tests de BAN

| #   | Scénario                      | Résultat attendu | Résultat réel |
| --- | ----------------------------- | ---------------- | ------------- |
| 14  | Admin bannit un utilisateur   | ✅ Succès        | ✅ OK         |
| 15  | Admin débannit un utilisateur | ✅ Succès        | ✅ OK         |
| 16  | CLIENT essaie de bannir       | ❌ 403           | ✅ OK         |
| 17  | WORKER essaie de bannir       | ❌ 403           | ✅ OK         |

### 5.4 Tests de SOFT DELETE

| #   | Scénario                                         | Résultat attendu | Résultat réel |
| --- | ------------------------------------------------ | ---------------- | ------------- |
| 18  | Admin soft-delete un utilisateur                 | ✅ Succès        | ✅ OK         |
| 19  | Admin restaure un utilisateur                    | ✅ Succès        | ✅ OK         |
| 20  | CLIENT essaie de soft-delete                     | ❌ 403           | ✅ OK         |
| 21  | Admin essaie de modifier un utilisateur supprimé | ❌ 400           | ✅ OK         |

---

## 6. INCOHÉRENCES ET FAILLES IDENTIFIÉES

### 6.1 🔴 Faille CRITIQUE : Middleware blockBannedUser NON UTILISÉ

**Problème :**
Le middleware [`block-banned-user.middleware.ts`](src/shared/middleware/block-banned-user.middleware.ts) est défini et exporté mais **JAMAIS utilisé** dans l'application.

**Localisation :**

- Défini dans [`src/shared/middleware/block-banned-user.middleware.ts`](src/shared/middleware/block-banned-user.middleware.ts:36)
- Exporté dans [`src/shared/middleware/index.ts`](src/shared/middleware/index.ts:9)
- **Jamais importé ni utilisé dans [`app.ts`](src/app.ts)**

**Impact :**

- Un utilisateur banni peut se connecter (bloqué par login, mais peut-être par token expiré)
- Après connexion, un utilisateur banni peut accéder à toutes les routes protégées
- Le middleware `blockBannedUser` devrait être appliqué globalement

**Recommandation :**

```typescript
// Dans app.ts, après les routes d'auth
import { blockBannedUser } from "./shared/middleware/index.js";

// Appliquer le middleware blockBannedUser à toutes les routes sauf auth
app.use("/api", blockBannedUser);
```

---

### 6.2 🟠 Faille HAUTE : Routes SERVICES sans authentification

**Problème :**
Les routes de création, modification et suppression des services n'ont aucun middleware d'authentification.

**Localisation :**
[`src/modules/service/interface/service.routes.ts:156-173`](src/modules/service/interface/service.routes.ts:156)

```typescript
// Routes actuelles - AUCUN middleware
router.post("/", (req, res, next) => serviceController.create(req, res, next));
router.put("/:id", (req, res, next) =>
  serviceController.update(req, res, next),
);
router.delete("/:id", (req, res, next) =>
  serviceController.delete(req, res, next),
);
```

**Impact :**

- N'importe qui peut créer un service sans être connecté
- N'importe qui peut modifier/supprimer n'importe quel service
- Aucune vérification de propriété

**Recommandation :**

```typescript
import { authenticate } from "../../../shared/middleware/authenticate.middleware.js";

// POST /services - Créer un service (authentifié)
router.post("/", authenticate(), (req, res, next) =>
  serviceController.create(req, res, next),
);

// PUT /services/:id - Modifier son propre service
router.put("/:id", authenticate(), (req, res, next) =>
  serviceController.update(req, res, next),
);

// DELETE /services/:id - Supprimer son propre service
router.delete("/:id", authenticate(), (req, res, next) =>
  serviceController.delete(req, res, next),
);
```

---

### 6.3 🟠 Faille MOYENNE : Routes en double

**Problème :**
Il existe des routes redondantes qui font la même chose :

| Fonction               | Route 1                           | Route 2                                 |
| ---------------------- | --------------------------------- | --------------------------------------- |
| Activer utilisateur    | `PATCH /api/users/:id/activation` | `PATCH /api/admin/users/:id/activate`   |
| Désactiver utilisateur | -                                 | `PATCH /api/admin/users/:id/deactivate` |
| Bannir utilisateur     | `PATCH /api/users/:id/ban`        | `PATCH /api/admin/users/:id/ban`        |
| Soft delete            | `DELETE /api/users/:id`           | `DELETE /api/admin/users/:id`           |

**Localisation :**

- Routes utilisateur : [`user-status.routes.ts`](src/modules/user/interface/user-status.routes.ts)
- Routes admin : [`admin.routes.ts`](src/modules/admin/admin.routes.ts)

**Impact :**

- Confusion pour les développeurs
- Maintenance plus complexe
- Risque d'incohérence entre les implémentations

**Recommandation :**
Conserver uniquement les routes admin (`/api/admin/...`) et supprimer les routes utilisateur pour les actions admin.

---

### 6.4 🟡 Faille BASSE : GET /services sans filtrage

**Problème :**
La liste des services n'a pas de pagination ni de filtrage par statut du worker.

**Localisation :**
[`src/modules/service/interface/service.routes.ts:162`](src/modules/service/interface/service.routes.ts:162)

**Recommandation :**
Ajouter un filtre pour ne retourner que les services des workers APPROVED.

---

### 6.5 🟡 Amélioration : Worker reapply - vérifications manquantes

**Problème :**
Le use case [`reapply-worker.usecase.ts`](src/modules/worker/application/reapply-worker.usecase.ts) ne vérifie pas si le worker est banni ou supprimé.

**Recommandation :**
Ajouter les vérifications :

```typescript
// Vérifier que le worker n'est pas banni
if (worker.isBanned) {
  throw new BusinessError({
    message:
      "Vous ne pouvez pas refaire une demande car votre compte est banni",
    statusCode: HTTP_STATUS.FORBIDDEN,
  });
}
```

---

## 7. CORRECTIONS PROPOSÉES

### 7.1 Correction du middleware blockBannedUser

**Fichier :** `src/app.ts`

```typescript
// Ajout après les imports
import { blockBannedUser } from "./shared/middleware/index.js";

// ... (autres imports)

// Routes
app.use("/api/auth", authRoutes);

// ⚠️ AJOUTER ICI - Bloquer les utilisateurs bannis sur toutes les routes /api
app.use("/api", blockBannedUser);

app.use("/api/users", userRoutes);
app.use("/api/users", userStatusRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/professions", professionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/workers", workerRoutes);
```

### 7.2 Correction des routes services

**Fichier :** `src/modules/service/interface/service.routes.ts`

```typescript
import { Router } from "express";
import { serviceController } from "./service.controller.js";
import { authenticate } from "../../../shared/middleware/authenticate.middleware.js";

const router = Router();

// POST /services - Créer un service (authentifié requis)
router.post("/", authenticate(), (req, res, next) =>
  serviceController.create(req, res, next),
);

// GET /services - Liste des services (PUBLIC - OK)
router.get("/", (req, res, next) => serviceController.getAll(req, res, next));

// GET /services/:id - Détail service (PUBLIC - OK)
router.get("/:id", (req, res, next) =>
  serviceController.getById(req, res, next),
);

// PUT /services/:id - Modifier son service (authentifié requis)
router.put("/:id", authenticate(), (req, res, next) =>
  serviceController.update(req, res, next),
);

// DELETE /services/:id - Supprimer son service (authentifié requis)
router.delete("/:id", authenticate(), (req, res, next) =>
  serviceController.delete(req, res, next),
);

export default router;
```

### 7.3 Correction du use case reapply-worker

**Fichier :** `src/modules/worker/application/reapply-worker.usecase.ts`

```typescript
// Après la vérification du rôle worker, ajouter :
// Vérifier que le worker n'est pas banni
if (worker.isBanned) {
  throw new BusinessError({
    message:
      "Vous ne pouvez pas refaire une demande car votre compte est banni",
    statusCode: HTTP_STATUS.FORBIDDEN,
    code: ERROR_CODES.FORBIDDEN,
  });
}

// Vérifier que le worker n'est pas soft-deleted
if (worker.deletedAt !== null) {
  throw new BusinessError({
    message: "Votre compte a été supprimé",
    statusCode: HTTP_STATUS.FORBIDDEN,
    code: ERROR_CODES.FORBIDDEN,
  });
}
```

---

## 8. RECOMMANDATIONS GÉNÉRALES

### 8.1 Points forts de l'application

✅ **Architecture Clean Architecture bien respectée**

- Séparation claire entre couches (interface, application, infrastructure)
- Utilisation d'interfaces pour les dépendances
- Use cases avec responsabilité unique

✅ **Gestion des erreurs centralisée**

- Middleware d'erreur global
- Codes d'erreur cohérents
- Messages structurés

✅ **Validation des entrées**

- Utilisation de Zod pour la validation
- Schémas définis pour les requêtes

✅ **Sécurité des mots de passe**

- Service PasswordService centralisé
- Hachage approprié

✅ **Règles métier correctement implémentées**

- Login avec vérifications de statut
- Soft delete avec restauration
- Authorization basée sur les rôles

### 8.2 Points à améliorer

1. **Appliquer le middleware blockBannedUser** - Priorité CRITIQUE
2. **Sécuriser les routes services** - Priorité HAUTE
3. **Supprimer les routes en double** - Priorité MOYENNE
4. **Ajouter des tests unitaires** - Priorité HAUTE
5. **Documenter les use cases** - Priorité BASSE
6. **Ajouter une validation plus stricte** sur les services (propriété du worker)

### 8.3 Cycle de vie d'un utilisateur

```
┌─────────────────┐
│  INSCRIPTION    │
│  (CLIENT/WORKER)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   WORKER       │     │    CLIENT       │
│  PENDING       │────▶│    ACTIF        │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  APPROVED ou   │     │   isActive      │
│  REJECTED      │     │   = false       │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  REAPPLY       │     │   SUPPRIMÉ     │
│  possible      │     │  (soft delete)  │
└─────────────────┘     └─────────────────┘
```

### 8.4 Gestion des rôles

| Rôle       | Permissions                                                                |
| ---------- | -------------------------------------------------------------------------- |
| **ADMIN**  | Toutes les actions de gestion utilisateur, professions, validation workers |
| **CLIENT** | Login, créer des services (si modifié), gérer son propre compte            |
| **WORKER** | Login, gérer ses services, reapply si rejeté                               |

### 8.5 Gestion des statuts

| Statut   | Login | Modifier son compte | Actions  |
| -------- | ----- | ------------------- | -------- |
| ACTIF    | ✅    | ✅                  | Toutes   |
| INACTIF  | ✅    | ✅                  | Limitées |
| BANNI    | ❌    | ❌                  | Aucune   |
| SUPPRIMÉ | ❌    | ❌                  | Aucune   |

---

## 9. CONCLUSION

### Résumé de l'audit

| Catégorie                 | Résultat                |
| ------------------------- | ----------------------- |
| Routes fonctionnent       | ✅ 95%                  |
| Règles d'accès respectées | ⚠️ Partiellement        |
| Règles métier correctes   | ✅ 90%                  |
| Faille logique            | 🔴 1 CRITIQUE, 2 HAUTES |
| Clean Architecture        | ✅ Bien respecté        |

### Actions prioritaires

1. **URGENT** : Appliquer le middleware `blockBannedUser`
2. **HAUT** : Ajouter l'authentification aux routes de services
3. **MOYEN** : Nettoyer les routes en double

### Score de sécurité : 7/10

L'application est bien structurée et suit les bonnes pratiques, mais nécessite des corrections de sécurité importantes avant mise en production.

---

_Document généré automatiquement lors de l'audit technique du 26 février 2026_
