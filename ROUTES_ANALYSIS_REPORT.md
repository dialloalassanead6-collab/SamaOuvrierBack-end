# Rapport d'Analyse des Routes et Permissions

## SamaOuvrierBackEnd - Application Node.js/Express/TypeScript avec Clean Architecture

---

## Table des Matières

1. [Vue d'Ensemble de l'Architecture](#1-vue-densemble-de-larchitecture)
2. [Tableau Récapitulatif des Routes](#2-tableau-récapitulatif-des-routes)
3. [Analyse des Routes par Module](#3-analyse-des-routes-par-module)
4. [Flux de Sécurité](#4-flux-de-sécurité)
5. [Analyse du Login et de la Création d'Utilisateurs](#5-analyse-du-login-et-de-la-création-dutilisateurs)
6. [Règles Spécifiques des Modules](#6-règles-spécifiques-des-modules)
7. [Pagination et Filtres](#7-pagination-et-filtres)
8. [Problèmes de Sécurité Détectés](#8-problèmes-de-sécurité-détectés)
9. [Recommandations](#9-recommandations)

---

## 1. Vue d'Ensemble de l'Architecture

### 1.1 Structure du Projet

L'application suit les principes de la **Clean Architecture** avec les couches suivantes :

- **Interface Layer** (`/src/modules/*/interface/`) : Routes, Controllers, Validation
- **Application Layer** (`/src/modules/*/application/`) : Use Cases
- **Domain Layer** (`/src/modules/*/domain/`) : Entités, Types
- **Infrastructure Layer** (`/src/modules/*/infrastructure/`) : Repositories Prisma

### 1.2 Rôles Utilisés

| Rôle     | Description                        |
| -------- | ---------------------------------- |
| `ADMIN`  | Administrateur de la plateforme    |
| `CLIENT` | Client recherchant des services    |
| `WORKER` | Travailleur proposant des services |

### 1.3 Statuts des Workers

| Statut     | Description                          |
| ---------- | ------------------------------------ |
| `PENDING`  | En attente de validation par l'admin |
| `APPROVED` | Approuvé, peut proposer des services |
| `REJECTED` | Rejeté, peut refaire une demande     |

### 1.4 Middlewares de Sécurité

| Middleware         | Fonction                                                  |
| ------------------ | --------------------------------------------------------- |
| `authenticate()`   | Vérifie le token JWT et injecte `req.user`                |
| `authorize(roles)` | Vérifie que l'utilisateur a le bon rôle                   |
| `blockBannedUser`  | Bloque les utilisateurs bannis ou supprimés (soft delete) |

### 1.5 Estados Utilisateur

| Champ       | Description                      | Impact sur la Connexion |
| ----------- | -------------------------------- | ----------------------- |
| `isBanned`  | Utilisateur banni                | **REFUSE** la connexion |
| `deletedAt` | Soft delete (non nul = supprimé) | **REFUSE** la connexion |
| `isActive`  | Compte actif/inactif             | **PERMET** la connexion |

---

## 2. Tableau Récapitulatif des Routes

### 2.1 Routes Publiques (Aucune Authentification Requise)

| Méthode    | Chemin               | Middleware | Accès                             | Statut Sécurité |
| ---------- | -------------------- | ---------- | --------------------------------- | --------------- |
| POST       | `/api/auth/register` | Aucun      | PUBLIC (CLIENT/WORKER uniquement) | ✅ Sécurisé     |
| POST       | `/api/auth/login`    | Aucun      | PUBLIC                            | ✅ Sécurisé     |
| /services` | Aucun                | PUBLIC GET | `/api                             | ✅ Sécurisé     |
| GET        | `/api/services/:id`  | Aucun      | PUBLIC                            | ✅ Sécurisé     |
| GET        | `/api/professions`   | Aucun      | PUBLIC                            | ✅ Sécurisé     |
| GET        | `/health`            | Aucun      | PUBLIC                            | ✅ Sécurisé     |

### 2.2 Routes Protégées - Utilisateurs

| Méthode | Chemin                      | Middleware                      | Accès      | Interdit       | Statut Sécurité      |
| ------- | --------------------------- | ------------------------------- | ---------- | -------------- | -------------------- |
| GET     | `/api/users`                | authenticate + authorize(ADMIN) | ADMIN      | CLIENT, WORKER | ✅ Sécurisé          |
| POST    | `/api/users`                | authenticate + authorize(ADMIN) | ADMIN      | CLIENT, WORKER | ✅ Sécurisé          |
| GET     | `/api/users/:id`            | authenticate + authorize(ADMIN) | ADMIN      | CLIENT, WORKER | ✅ Sécurisé          |
| PUT     | `/api/users/:id`            | authenticate + authorize(ADMIN) | ADMIN      | CLIENT, WORKER | ✅ Sécurisé          |
| DELETE  | `/api/users/:id`            | authenticate + authorize(ADMIN) | ADMIN      | CLIENT, WORKER | ✅ Sécurisé          |
| PATCH   | `/api/users/me/activation`  | authenticate                    | Tous rôles | -              | ⚠️ Vérifier use case |
| PATCH   | `/api/users/:id/activation` | authenticate + authorize(ADMIN) | ADMIN      | -              | ✅ Sécurisé          |
| PATCH   | `/api/users/:id/ban`        | authenticate + authorize(ADMIN) | ADMIN      | -              | ✅ Sécurisé          |

### 2.3 Routes Protégées - Services

| Méthode | Chemin              | Middleware                              | Accès                        | Interdit | Statut Sécurité       |
| ------- | ------------------- | --------------------------------------- | ---------------------------- | -------- | --------------------- |
| GET     | `/api/services`     | Aucun                                   | PUBLIC                       | -        | ✅ Sécurisé           |
| GET     | `/api/services/:id` | Aucun                                   | PUBLIC                       | -        | ✅ Sécurisé           |
| POST    | `/api/services`     | authenticate + authorize(WORKER, ADMIN) | WORKER, ADMIN                | CLIENT   | ✅ Sécurisé           |
| PUT     | `/api/services/:id` | authenticate + authorize(WORKER, ADMIN) | WORKER (ses services), ADMIN | CLIENT   | ✅ Vérifier ownership |
| DELETE  | `/api/services/:id` | authenticate + authorize(WORKER, ADMIN) | WORKER (ses services), ADMIN | CLIENT   | ✅ Vérifier ownership |

### 2.4 Routes Protégées - Workers

| Méthode | Chemin                    | Middleware                       | Accès  | Interdit      | Statut Sécurité    |
| ------- | ------------------------- | -------------------------------- | ------ | ------------- | ------------------ |
| PATCH   | `/api/workers/me/reapply` | authenticate + authorize(WORKER) | WORKER | CLIENT, ADMIN | ✅ Vérifier statut |

### 2.5 Routes Protégées - Professions

| Méthode | Chemin                 | Middleware                      | Accès  | Interdit       | Statut Sécurité |
| ------- | ---------------------- | ------------------------------- | ------ | -------------- | --------------- |
| GET     | `/api/professions`     | Aucun                           | PUBLIC | -              | ✅ Sécurisé     |
| POST    | `/api/professions`     | authenticate + authorize(ADMIN) | ADMIN  | CLIENT, WORKER | ✅ Sécurisé     |
| PATCH   | `/api/professions/:id` | authenticate + authorize(ADMIN) | ADMIN  | CLIENT, WORKER | ✅ Sécurisé     |
| DELETE  | `/api/professions/:id` | authenticate + authorize(ADMIN) | ADMIN  | CLIENT, WORKER | ✅ Sécurisé     |

### 2.6 Routes Protégées - Admin

| Méthode | Chemin                            | Middleware                      | Accès | Interdit       | Statut Sécurité |
| ------- | --------------------------------- | ------------------------------- | ----- | -------------- | --------------- |
| GET     | `/api/admin/workers`              | authenticate + authorize(ADMIN) | ADMIN | CLIENT, WORKER | ✅ Sécurisé     |
| PATCH   | `/api/admin/workers/:id/approve`  | authenticate + authorize(ADMIN) | ADMIN | -              | ✅ Sécurisé     |
| PATCH   | `/api/admin/workers/:id/reject`   | authenticate + authorize(ADMIN) | ADMIN | -              | ✅ Sécurisé     |
| PATCH   | `/api/admin/users/:id/activate`   | authenticate + authorize(ADMIN) | ADMIN | -              | ✅ Sécurisé     |
| PATCH   | `/api/admin/users/:id/deactivate` | authenticate + authorize(ADMIN) | ADMIN | -              | ✅ Sécurisé     |
| PATCH   | `/api/admin/users/:id/ban`        | authenticate + authorize(ADMIN) | ADMIN | -              | ✅ Sécurisé     |
| PATCH   | `/api/admin/users/:id/unban`      | authenticate + authorize(ADMIN) | ADMIN | -              | ✅ Sécurisé     |
| DELETE  | `/api/admin/users/:id`            | authenticate + authorize(ADMIN) | ADMIN | -              | ✅ Sécurisé     |
| PATCH   | `/api/admin/users/:id/restore`    | authenticate + authorize(ADMIN) | ADMIN | -              | ✅ Sécurisé     |

---

## 3. Analyse des Routes par Module

### 3.1 Module Authentification (`/api/auth`)

#### POST `/api/auth/register`

**Description** : Inscription d'un nouvel utilisateur (CLIENT ou WORKER)

**Flux de sécurité** :

1. Validation des données avec Zod
2. Vérification que l'email n'existe pas
3. **Hashage du mot de passe** avec bcrypt (via PasswordService)
4. Création de l'utilisateur avec le rôle approprié

**Règles métier** :

- ✅ CLIENT : `professionId` ne doit pas être présent
- ✅ WORKER : `professionId` est obligatoire
- ✅ ADMIN : Inscription INTERDITE (403)
- ✅ Nouveau utilisateur : `isActive = true`, `isBanned = false`

**Vulnérabilité potentielle** : Aucune détectée - le hashage est correctement appliqué.

---

#### POST `/api/auth/login`

**Description** : Connexion utilisateur

**Flux de sécurité** :

1. Validation des identifiants (email + password)
2. Recherche de l'utilisateur par email (inclut le hash du mot de passe)
3. Comparaison du mot de passe avec bcrypt
4. Validation du statut utilisateur (banni/supprimé)
5. Validation du statut worker (si applicable)
6. Génération du token JWT

**Règles de connexion** :

| Condition                                   | Résultat   | Code Erreur             |
| ------------------------------------------- | ---------- | ----------------------- |
| Mauvais email/password                      | REFUS      | 401 INVALID_CREDENTIALS |
| `isBanned = true`                           | REFUS      | 403 USER_BANNED         |
| `deletedAt != null`                         | REFUS      | 403 USER_DELETED        |
| `isActive = false`                          | **PERMET** | -                       |
| `role = WORKER` + `workerStatus = PENDING`  | REFUS      | 403 ACCOUNT_PENDING     |
| `role = WORKER` + `workerStatus = REJECTED` | REFUS      | 403 ACCOUNT_REJECTED    |
| `role = WORKER` + `workerStatus = APPROVED` | PERMET     | -                       |

**Point important** : Un utilisateur **inactif** (`isActive = false`) peut toujours se connecter - c'est une décision métier.

**Vulnérabilité potentielle** : Aucune détectée.

---

#### GET `/api/auth/me`

**Description** : Obtenir le profil de l'utilisateur connecté

**Sécurité** :

- Requiert authentication (token JWT)
- Retourne les informations de l'utilisateur authentifié

---

### 3.2 Module Utilisateur (`/api/users`)

#### Routes ADMIN uniquement

| Route               | Description                    | Middleware |
| ------------------- | ------------------------------ | ---------- |
| GET `/users`        | Liste paginée des utilisateurs | ADMIN      |
| POST `/users`       | Créer un utilisateur           | ADMIN      |
| GET `/users/:id`    | Obtenir un utilisateur         | ADMIN      |
| PUT `/users/:id`    | Modifier un utilisateur        | ADMIN      |
| DELETE `/users/:id` | Supprimer un utilisateur       | ADMIN      |

**Important** : Ces routes ont leur propre `authenticate()` et `authorize(Role.ADMIN)` dans `user.routes.ts`, mais le `blockBannedUser` middleware global dans `app.ts` s'applique également.

---

#### PATCH `/api/users/me/activation`

**Description** : Activer/désactiver son propre compte

**Flux de sécurité** :

1. Authentification requise
2. Utilisation de `currentUserId` depuis le JWT (jamais du body)
3. Vérifications dans le UseCase :
   - ✅ `isBanned = true` → REFUS (403)
   - ✅ `deletedAt != null` → REFUS (403)
   - ✅ `isActive = false` → PERMET la modification

**Règle importante** : Un utilisateur banni ne peut pas modifier son propre compte.

---

### 3.3 Module Service (`/api/services`)

#### Routes Publiques

| Route               | Description                         |
| ------------------- | ----------------------------------- |
| GET `/services`     | Liste paginée des services (PUBLIC) |
| GET `/services/:id` | Détails d'un service (PUBLIC)       |

**Filtres disponibles** :

- `page` : Numéro de page (défaut: 1)
- `pageSize` : Nombre d'éléments par page (défaut: 10)
- `workerId` : Filtrer par worker (optionnel)

---

#### Routes Protégées

| Route                  | Rôle requis   | Ownership                              |
| ---------------------- | ------------- | -------------------------------------- |
| POST `/services`       | WORKER, ADMIN | WORKER crée pour lui-même              |
| PUT `/services/:id`    | WORKER, ADMIN | Vérification ownership dans le UseCase |
| DELETE `/services/:id` | WORKER, ADMIN | Vérification ownership dans le UseCase |

**Logique d'ownership (UseCase)** :

```typescript
// Pour WORKER :
if (userRole === "WORKER" && !service.belongsToWorker(userId)) {
  throw BusinessErrors.forbidden(
    "Vous ne pouvez modifier que vos propres services",
  );
}

// Pour ADMIN :
// Peut modifier TOUT service
```

**Vulnérabilité** : La vérification d'ownership est faite dans le UseCase, pas dans le middleware - c'est correct mais pourrait être renforcé.

---

### 3.4 Module Worker (`/api/workers`)

#### PATCH `/workers/me/reapply`

**Description** : Permet à un worker rejeté de refaire une demande

**Conditions d'accès** :

- ✅ Doit être authentifié
- ✅ Rôle = WORKER uniquement
- ✅ `isBanned = false` (sinon 403)
- ✅ `deletedAt = null` (sinon 403)
- ✅ `workerStatus = REJECTED` (sinon 403)
- ✅ Met à jour `workerStatus` vers `PENDING`

**Flux** :

1. Vérification existence du worker
2. Vérification du rôle
3. Vérification `isBanned`
4. Vérification `deletedAt`
5. Vérification du statut actuel
6. Mise à jour vers PENDING

---

### 3.5 Module Profession (`/api/professions`)

| Route                     | Accès  | Description              |
| ------------------------- | ------ | ------------------------ |
| GET `/professions`        | PUBLIC | Liste des professions    |
| POST `/professions`       | ADMIN  | Créer une profession     |
| PATCH `/professions/:id`  | ADMIN  | Modifier une profession  |
| DELETE `/professions/:id` | ADMIN  | Supprimer une profession |

**Note** : La route GET est publique, ce qui est cohérent pour permettre aux clients de voir les professions disponibles.

---

### 3.6 Module Admin (`/api/admin`)

#### Gestion des Workers

| Route                              | Description                            | Accès |
| ---------------------------------- | -------------------------------------- | ----- |
| GET `/admin/workers`               | Liste des workers (avec filtre statut) | ADMIN |
| PATCH `/admin/workers/:id/approve` | Approuver un worker                    | ADMIN |
| PATCH `/admin/workers/:id/reject`  | Rejeter un worker                      | ADMIN |

#### Gestion des Utilisateurs

| Route                               | Description                | Accès |
| ----------------------------------- | -------------------------- | ----- |
| PATCH `/admin/users/:id/activate`   | Activer un utilisateur     | ADMIN |
| PATCH `/admin/users/:id/deactivate` | Désactiver un utilisateur  | ADMIN |
| PATCH `/admin/users/:id/ban`        | Bannir un utilisateur      | ADMIN |
| PATCH `/admin/users/:id/unban`      | Débannir un utilisateur    | ADMIN |
| DELETE `/admin/users/:id`           | Soft delete un utilisateur | ADMIN |
| PATCH `/admin/users/:id/restore`    | Restaurer un utilisateur   | ADMIN |

---

## 4. Flux de Sécurité

### 4.1 Diagramme du Flux Global

```
Requête HTTP
    │
    ▼
┌─────────────────────────────┐
│ 1. Route Matching           │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ 2. Middleware Global        │
│ - blockBannedUser           │
│ (sauf routes exclues)       │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ 3. Middleware Route        │
│ - authenticate()            │
│ - authorize(roles)          │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ 4. Controller               │
│ - Validation                │
│ - Extraction JWT data       │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ 5. UseCase                  │
│ - Logique métier            │
│ - Vérifications ownership   │
│ - Vérifications statut      │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ 6. Repository               │
│ - Accès Base de données     │
│ - Transformation entités    │
└─────────────────────────────┘
    │
    ▼
Réponse HTTP
```

### 4.2 Flux Détailé pour Chaque Type de Route

#### Route Publique (ex: GET /services)

```
Requête → Route (pas de middleware auth) → Controller → UseCase → Repository → Réponse
```

#### Route Protégée Simple (ex: POST /services)

```
Requête → authenticate() → authorize(WORKER,ADMIN) → Controller → UseCase → Repository → Réponse
```

#### Route avec Ownership (ex: PUT /services/:id)

```
Requête → authenticate() → authorize(WORKER,ADMIN) → Controller → UseCase (vérifie ownership) → Repository → Réponse
```

#### Route avec Vérification de Statut (ex: /workers/me/reapply)

```
Requête → authenticate() → authorize(WORKER) → UseCase (vérifie isBanned, deletedAt, workerStatus) → Repository → Réponse
```

---

## 5. Analyse du Login et de la Création d'Utilisateurs

### 5.1 Inscription (Register)

**Point de sécurité vérifié** : Le mot de passe est correctement hashé avant d'être stocké en base de données.

```typescript
// Dans register.usecase.ts
const hashedPassword = await this.passwordService.hash(input.password);
// Puis kullanıcı oluşturulur
```

** Vérification** : ✅ Le hashage est appliqué dans le UseCase, pas dans le Controller.

### 5.2 Connexion (Login)

**Règles appliquées** :

| Scénario                            | Comportement                 | Code |
| ----------------------------------- | ---------------------------- | ---- |
| Utilisateur normal (isActive=false) | **PEUT** se connecter        | 200  |
| Utilisateur banni                   | **NE PEUT PAS** se connecter | 403  |
| Utilisateur soft-deleted            | **NE PEUT PAS** se connecter | 403  |
| Worker PENDING                      | **NE PEUT PAS** se connecter | 403  |
| Worker REJECTED                     | **NE PEUT PAS** se connecter | 403  |
| Worker APPROVED                     | **PEUT** se connecter        | 200  |

**Point important** : isActive=false n'empêche PAS la connexion - c'est un choix métier à documenter.

---

## 6. Règles Spécifiques des Modules

### 6.1 Users

| Action           | Qui peut faire   | Vérifications                     |
| ---------------- | ---------------- | --------------------------------- |
| Créer user       | ADMIN uniquement | -                                 |
| Liste users      | ADMIN uniquement | Exclut soft-deleted               |
| Modifier self    | Tous rôles       | Doit être propriétaire, non-banni |
| Modifier autre   | ADMIN            | Via UseCase                       |
| Activation self  | Tous rôles       | isBanned=false, deletedAt=null    |
| Activation autre | ADMIN            | -                                 |
| Ban/Unban        | ADMIN            | -                                 |
| Soft delete      | ADMIN            | -                                 |
| Restore          | ADMIN            | -                                 |

### 6.2 Services

| Action    | Qui peut faire               | Ownership                 |
| --------- | ---------------------------- | ------------------------- |
| Lire      | PUBLIC                       | -                         |
| Créer     | WORKER, ADMIN                | workerId = JWT.sub        |
| Modifier  | WORKER (ses services), ADMIN | Vérification dans UseCase |
| Supprimer | WORKER (ses services), ADMIN | Vérification dans UseCase |

### 6.3 Workers

| Action  | Qui peut faire | Conditions                                            |
| ------- | -------------- | ----------------------------------------------------- |
| Reapply | WORKER         | workerStatus=REJECTED, isBanned=false, deletedAt=null |

### 6.4 Professions

| Action    | Qui peut faire |
| --------- | -------------- |
| Lire      | PUBLIC         |
| Créer     | ADMIN          |
| Modifier  | ADMIN          |
| Supprimer | ADMIN          |

### 6.5 Admin

**Toutes les routes admin** : Réservées EXCLUSIVEMENT au rôle ADMIN.

---

## 7. Pagination et Filtres

### 7.1 Routes avec Pagination

| Route              | Paramètres               | Défaut              |
| ------------------ | ------------------------ | ------------------- |
| GET /users         | page, pageSize           | page=1, pageSize=10 |
| GET /services      | page, pageSize, workerId | page=1, pageSize=10 |
| GET /admin/workers | skip, take, status       | skip=0, take=20     |

### 7.2 Filtres Appliqués

**GET /services** :

- `workerId` : Optionnel, filtre par worker

**GET /admin/workers** :

- `status` : Optionnel (PENDING, APPROVED, REJECTED)

### 7.3 Note sur la Pagination

- ✅ Pagination obligatoire pour les services publics
- ✅ Pagination présente pour les utilisateurs et workers admin
- ⚠️ **Pas de limite maximale** sur pageSize - devrait être limitée pour éviter les abus

---

## 8. Problèmes de Sécurité Détectés

### 8.1 Observations Positives

✅ **Architecture bien pensée** : Clean Architecture correctement implémentée

✅ **Séparation des préoccupations** : Controllers, UseCases, Repositories bien séparés

✅ **Validation des entrées** : Utilisation de Zod pour la validation

✅ **Password hashing** : bcrypt utilisé pour le hashage

✅ **JWT sécurisé** : Token signé avec clé secrète, rôle pris du token jamais du body

✅ **Ownership vérifié** : Les UseCases vérifient l'appartenance des ressources

✅ **Soft delete** : Suppression logique plutôt que physique

✅ **Statut worker** : Contrôle du statut pour l'approbation des workers

### 8.2 Points d'Attention

⚠️ **Pagination sans limite maximale** : Le paramètre `pageSize` n'a pas de limite maximale définie dans les controllers, ce qui pourrait permettre des запросы volumineux.

**Recommandation** : Ajouter une limite maximale :

```typescript
const pageSize = Math.min(Number(req.query["pageSize"]) || 10, 100);
```

⚠️ **Route /users/:id/activation et /users/:id/ban dans user-status.routes.ts** : Ces routes n'ont pas le middleware `authorize(ADMIN)` appliqué au niveau du router, mais le UseCase pourrait nécessiter des vérifications supplémentaires.

**Vérification** : En regardant le code, le middleware `authorize(Role.ADMIN)` est bien appliqué à la route `/users/:id/activation` (ligne 244 de user-status.routes.ts).

### 8.3 Routes Publiques - Analyse des Risques

| Route               | Risque                     | Évaluation                        |
| ------------------- | -------------------------- | --------------------------------- |
| GET /services       | Exposition données workers | ✅ Acceptable (données publiques) |
| GET /professions    | Exposition professions     | ✅ Acceptable                     |
| POST /auth/register | Création de comptes        | ✅ Protégé contre ADMIN           |
| POST /auth/login    | Brute force                | ⚠️ À protéger avec rate limiting  |

---

## 9. Recommandations

### 9.1 Améliorations Immédiates

1. **Rate Limiting** : Implémenter un middleware de rate limiting pour les routes de login/register afin de prévenir les attaques par force brute.

2. **Limite de Pagination** : Ajouter une limite maximale au paramètre `pageSize`.

3. **Logging** : Ajouter un logging des actions sensibles (ban, soft delete, approval/rejection).

4. **Validation des UUID** : Valider que les IDs dans les URLs sont des UUIDs valides.

### 9.2 Améliorations à Long Terme

1. **Gestion des mots de passe** : Implémenter une politique de mot de passe fort (longueur minimale, caractères spéciaux).

2. **2FA** : Envisager l'authentification à deux facteurs pour les comptes admin.

3. **Audit Trail** : Créer un système d'audit pour suivre toutes les actions administratives.

4. **Cache** : Mettre en cache les professions et services fréquemment consultés.

---

## Annexe : Tableau Complet des Routes

| #   | Méthode | Chemin                          | Auth | Rôle Requis  | Accès        | Interdit      | ownership      |
| --- | ------- | ------------------------------- | ---- | ------------ | ------------ | ------------- | -------------- |
| 1   | POST    | /api/auth/register              | ❌   | -            | PUBLIC       | ADMIN         | N/A            |
| 2   | POST    | /api/auth/login                 | ❌   | -            | PUBLIC       | -             | N/A            |
| 3   | GET     | /api/auth/me                    | ✅   | Tous         | Auth         | -             | N/A            |
| 4   | GET     | /api/services                   | ❌   | -            | PUBLIC       | -             | N/A            |
| 5   | GET     | /api/services/:id               | ❌   | -            | PUBLIC       | -             | N/A            |
| 6   | POST    | /api/services                   | ✅   | WORKER,ADMIN | Worker/Admin | CLIENT        | ✅ (UseCase)   |
| 7   | PUT     | /api/services/:id               | ✅   | WORKER,ADMIN | Worker/Admin | CLIENT        | ✅ (UseCase)   |
| 8   | DELETE  | /api/services/:id               | ✅   | WORKER,ADMIN | Worker/Admin | CLIENT        | ✅ (UseCase)   |
| 9   | GET     | /api/professions                | ❌   | -            | PUBLIC       | -             | N/A            |
| 10  | POST    | /api/professions                | ✅   | ADMIN        | ADMIN        | CLIENT,WORKER | N/A            |
| 11  | PATCH   | /api/professions/:id            | ✅   | ADMIN        | ADMIN        | CLIENT,WORKER | N/A            |
| 12  | DELETE  | /api/professions/:id            | ✅   | ADMIN        | ADMIN        | CLIENT,WORKER | N/A            |
| 13  | GET     | /api/users                      | ✅   | ADMIN        | ADMIN        | CLIENT,WORKER | N/A            |
| 14  | POST    | /api/users                      | ✅   | ADMIN        | ADMIN        | CLIENT,WORKER | N/A            |
| 15  | GET     | /api/users/:id                  | ✅   | ADMIN        | ADMIN        | CLIENT,WORKER | N/A            |
| 16  | PUT     | /api/users/:id                  | ✅   | ADMIN        | ADMIN        | CLIENT,WORKER | N/A            |
| 17  | DELETE  | /api/users/:id                  | ✅   | ADMIN        | ADMIN        | CLIENT,WORKER | N/A            |
| 18  | PATCH   | /api/users/me/activation        | ✅   | Tous         | Auth         | -             | ✅ (self only) |
| 19  | PATCH   | /api/users/:id/activation       | ✅   | ADMIN        | ADMIN        | -             | N/A            |
| 20  | PATCH   | /api/users/:id/ban              | ✅   | ADMIN        | ADMIN        | -             | N/A            |
| 21  | PATCH   | /api/workers/me/reapply         | ✅   | WORKER       | WORKER       | CLIENT,ADMIN  | ✅ (self only) |
| 22  | GET     | /api/admin/workers              | ✅   | ADMIN        | ADMIN        | -             | N/A            |
| 23  | PATCH   | /api/admin/workers/:id/approve  | ✅   | ADMIN        | ADMIN        | -             | N/A            |
| 24  | PATCH   | /api/admin/workers/:id/reject   | ✅   | ADMIN        | ADMIN        | -             | N/A            |
| 25  | PATCH   | /api/admin/users/:id/activate   | ✅   | ADMIN        | ADMIN        | -             | N/A            |
| 26  | PATCH   | /api/admin/users/:id/deactivate | ✅   | ADMIN        | ADMIN        | -             | N/A            |
| 27  | PATCH   | /api/admin/users/:id/ban        | ✅   | ADMIN        | ADMIN        | -             | N/A            |
| 28  | PATCH   | /api/admin/users/:id/unban      | ✅   | ADMIN        | ADMIN        | -             | N/A            |
| 29  | DELETE  | /api/admin/users/:id            | ✅   | ADMIN        | ADMIN        | -             | N/A            |
| 30  | PATCH   | /api/admin/users/:id/restore    | ✅   | ADMIN        | ADMIN        | -             | N/A            |
| 31  | GET     | /health                         | ❌   | -            | PUBLIC       | -             | N/A            |

---

_Rapport généré le 26 février 2026_
_Application : SamaOuvrierBackEnd_
_Architecture : Clean Architecture avec TypeScript_
