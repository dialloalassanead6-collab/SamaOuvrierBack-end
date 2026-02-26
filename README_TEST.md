# SamaOuvrier Backend - Documentation API

## 📋 Table des Matières

1. [Présentation du Projet](#1️⃣-présentation-du-projet)
2. [Authentification](#2️⃣-authentification)
3. [Liste Complète des Endpoints](#3️⃣-liste-complète-des-endpoints)
4. [Règles Métier Importantes](#4️⃣-règles-métier-importantes)
5. [Flow Complet de Test sur Postman](#5️⃣-flow-complet-de-test-sur-postman)
6. [Données Seed Nécessaires](#6️⃣-données-seed-nécessaires)
7. [Structure des Réponses Standardisées](#7️⃣-structure-des-réponses-standardisées)
8. [Problèmes de Sécurité Identifiés](#8️⃣-problèmes-de-sécurité-identifiés)

---

## 1️⃣ Présentation du Projet

### Description Technique

**SamaOuvrier** est une API backend pour un marketplace de services connectant les clients avec les prestataires (workers). L'application suit les principes de Clean Architecture avec une séparation stricte des responsabilités.

### Stack Utilisée

| Technologie    | Utilisation               |
| -------------- | ------------------------- |
| **Node.js**    | Environnement d'exécution |
| **Express.js** | Framework web             |
| **TypeScript** | Langage (mode strict)     |
| **Prisma ORM** | ORM de base de données    |
| **PostgreSQL** | Base de données           |
| **Zod**        | Validation des entrées    |
| **JWT**        | Authentification          |
| **Bcrypt**     | Hachage des mots de passe |

### Architecture Utilisée

```
src/
├── modules/
│   ├── auth/           # Module d'authentification
│   │   ├── interface/     # Contrôleur & Routes
│   │   ├── application/   # Interfaces des repositories
│   │   ├── domain/        # Types & entités
│   │   └── infrastructure/# Repository Prisma
│   ├── user/           # Module de gestion des utilisateurs
│   │   ├── interface/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   └── service/       # Module des services
│       ├── interface/
│       ├── application/
│       ├── domain/
│       └── infrastructure/
└── shared/
    ├── middleware/        # Auth, gestionnaires d'erreurs
    ├── config/           # Configuration environnementale
    └── database/         # Client Prisma
```

---

## 2️⃣ Authentification

### Comment obtenir un token

1. **S'inscrire** - Créer un nouveau compte (rôle CLIENT automatique)
2. **Se connecter** - S'authentifier avec email/mot de passe

Les deux endpoints retournent un token JWT dans la réponse.

### Format du Header Authorization

```
Authorization: Bearer <TOKEN>
```

**Exemple :**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC05MGFiLWNkZWYiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoiQ0xJRU5UIiwiaWF0IjoxNzA2NjM2MDAwfQ.xxxxxxxxxxxxx
```

### Structure du Payload JWT

```json
{
  "sub": "uuid-de-l-utilisateur",
  "email": "utilisateur@exemple.com",
  "role": "CLIENT|WORKER|ADMIN",
  "iat": 1706636000,
  "exp": 1707240800
}
```

---

## 3️⃣ Liste Complète des Endpoints

### 📌 MODULE AUTHENTIFICATION (`/auth`)

---

#### 🔹 POST /auth/register

Créer un nouvel utilisateur (rôle CLIENT automatique).

|                 |                                     |
| --------------- | ----------------------------------- |
| **Description** | Créer un nouveau compte utilisateur |
| **Auth requis** | Non                                 |
| **Rôle requis** | -                                   |

**📥 Requête**

Headers:

```
Content-Type: application/json
```

Body:

```json
{
  "email": "utilisateur@exemple.com",
  "password": "motdepasse123",
  "name": "Jean Dupont"
}
```

**📤 Réponse Succès**

Status: `201 Created`

```json
{
  "user": {
    "id": "uuid-string",
    "email": "utilisateur@exemple.com",
    "name": "Jean Dupont",
    "role": "CLIENT",
    "createdAt": "2024-02-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**❌ Réponses d'Erreur**

| Status | Body                                    |
| ------ | --------------------------------------- |
| 409    | `{"error": "Email already registered"}` |
| 400    | Erreur de validation Zod                |

---

#### 🔹 POST /auth/login

S'authentifier et obtenir un token JWT.

|                 |                                      |
| --------------- | ------------------------------------ |
| **Description** | Connexion avec email et mot de passe |
| **Auth requis** | Non                                  |
| **Rôle requis** | -                                    |

**📥 Requête**

Headers:

```
Content-Type: application/json
```

Body:

```json
{
  "email": "utilisateur@exemple.com",
  "password": "motdepasse123"
}
```

**📤 Réponse Succès**

Status: `200 OK`

```json
{
  "user": {
    "id": "uuid-string",
    "email": "utilisateur@exemple.com",
    "name": "Jean Dupont",
    "role": "CLIENT",
    "createdAt": "2024-02-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**❌ Réponses d'Erreur**

| Status | Body                               |
| ------ | ---------------------------------- |
| 401    | `{"error": "Invalid credentials"}` |
| 400    | Erreur de validation               |

---

#### 🔹 GET /auth/me

Obtenir le profil de l'utilisateur authentifié.

|                 |                                             |
| --------------- | ------------------------------------------- |
| **Description** | Obtenir les infos de l'utilisateur connecté |
| **Auth requis** | ✅ Oui                                      |
| **Rôle requis** | CLIENT, WORKER, ou ADMIN                    |

**📥 Requête**

Headers:

```
Authorization: Bearer <TOKEN>
```

**📤 Réponse Succès**

Status: `200 OK`

```json
{
  "id": "uuid-string",
  "email": "utilisateur@exemple.com",
  "name": "Jean Dupont",
  "role": "CLIENT",
  "createdAt": "2024-02-01T00:00:00.000Z"
}
```

**❌ Réponses d'Erreur**

| Status | Body                                               |
| ------ | -------------------------------------------------- |
| 401    | `{"error": "Authorization header missing"}`        |
| 401    | `{"error": "Invalid authorization header format"}` |
| 401    | `{"error": "Invalid or expired token"}`            |
| 404    | `{"error": "User not found"}`                      |

---

### 📌 MODULE UTILISATEUR (`/users`)

#### ⚠️ PROBLÈME DE SÉCURITÉ : Tous les endpoints utilisateurs sont NON PROTÉGÉS !

---

#### 🔹 POST /users

Créer un nouvel utilisateur (l'admin peut définir n'importe quel rôle).

|                 |                             |
| --------------- | --------------------------- |
| **Description** | Créer un nouvel utilisateur |
| **Auth requis** | ❌ **NON PROTÉGÉ**          |
| **Rôle requis** | -                           |

**📥 Requête**

Headers:

```
Content-Type: application/json
```

Body:

```json
{
  "email": "nouveaunutilisateur@exemple.com",
  "password": "motdepasse123",
  "name": "Nouvel Utilisateur",
  "role": "ADMIN"
}
```

**📤 Réponse Succès**

Status: `201 Created`

```json
{
  "id": "uuid-string",
  "email": "nouveaunutilisateur@exemple.com",
  "name": "Nouvel Utilisateur",
  "role": "ADMIN",
  "createdAt": "2024-02-01T00:00:00.000Z",
  "updatedAt": "2024-02-01T00:00:00.000Z"
}
```

**❌ Réponses d'Erreur**

| Status | Body                       |
| ------ | -------------------------- |
| 409    | Erreur email déjà existant |
| 400    | Erreur de validation       |

---

#### 🔹 GET /users

Obtenir tous les utilisateurs avec pagination.

|                 |                              |
| --------------- | ---------------------------- |
| **Description** | Lister tous les utilisateurs |
| **Auth requis** | ❌ **NON PROTÉGÉ**           |
| **Rôle requis** | -                            |

**📥 Requête**

Paramètres Query:

```
?page=1&pageSize=10
```

**📤 Réponse Succès**

Status: `200 OK`

```json
{
  "users": [
    {
      "id": "uuid-string",
      "email": "utilisateur@exemple.com",
      "name": "Jean Dupont",
      "role": "CLIENT",
      "createdAt": "2024-02-01T00:00:00.000Z",
      "updatedAt": "2024-02-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

#### 🔹 GET /users/:id

Obtenir un utilisateur par ID.

|                 |                                      |
| --------------- | ------------------------------------ |
| **Description** | Obtenir les détails d'un utilisateur |
| **Auth requis** | ❌ **NON PROTÉGÉ**                   |
| **Rôle requis** | -                                    |

**📥 Requête**

Params:

```
:id = uuid-string
```

**📤 Réponse Succès**

Status: `200 OK`

```json
{
  "id": "uuid-string",
  "email": "utilisateur@exemple.com",
  "name": "Jean Dupont",
  "role": "CLIENT",
  "createdAt": "2024-02-01T00:00:00.000Z",
  "updatedAt": "2024-02-01T00:00:00.000Z"
}
```

**❌ Réponses d'Erreur**

| Status | Body                   |
| ------ | ---------------------- |
| 404    | Utilisateur non trouvé |

---

#### 🔹 PUT /users/:id

Mettre à jour un utilisateur.

|                 |                                            |
| --------------- | ------------------------------------------ |
| **Description** | Mettre à jour les détails d'un utilisateur |
| **Auth requis** | ❌ **NON PROTÉGÉ**                         |
| **Rôle requis** | -                                          |

**📥 Requête**

Params:

```
:id = uuid-string
```

Body:

```json
{
  "email": "nouvelemail@exemple.com",
  "name": "Nom Mis à Jour",
  "role": "ADMIN"
}
```

**📤 Réponse Succès**

Status: `200 OK`

```json
{
  "id": "uuid-string",
  "email": "nouvelemail@exemple.com",
  "name": "Nom Mis à Jour",
  "role": "ADMIN",
  "createdAt": "2024-02-01T00:00:00.000Z",
  "updatedAt": "2024-02-02T00:00:00.000Z"
}
```

---

#### 🔹 DELETE /users/:id

Supprimer un utilisateur.

|                 |                          |
| --------------- | ------------------------ |
| **Description** | Supprimer un utilisateur |
| **Auth requis** | ❌ **NON PROTÉGÉ**       |
| **Rôle requis** | -                        |

**📥 Requête**

Params:

```
:id = uuid-string
```

**📤 Réponse Succès**

Status: `200 OK`

```json
{
  "message": "User deleted successfully"
}
```

**❌ Réponses d'Erreur**

| Status | Body                   |
| ------ | ---------------------- |
| 404    | Utilisateur non trouvé |

---

### 📌 MODULE SERVICE (`/services`)

#### ⚠️ PROBLÈME DE SÉCURITÉ : Tous les endpoints de services sont NON PROTÉGÉS !

---

#### 🔹 POST /services

Créer un nouveau service.

|                 |                    |
| --------------- | ------------------ |
| **Description** | Créer un service   |
| **Auth requis** | ❌ **NON PROTÉGÉ** |
| **Rôle requis** | -                  |

**📥 Requête**

Headers:

```
Content-Type: application/json
```

Body:

```json
{
  "title": "Réparation de Plomberie",
  "description": "Services professionnels de réparation de plomberie pour maisons",
  "minPrice": 50,
  "maxPrice": 200,
  "workerId": "uuid-du-worker"
}
```

**📤 Réponse Succès**

Status: `201 Created`

```json
{
  "id": "uuid-string",
  "title": "Réparation de Plomberie",
  "description": "Services professionnels de réparation de plomberie pour maisons",
  "minPrice": 50,
  "maxPrice": 200,
  "workerId": "uuid-du-worker",
  "createdAt": "2024-02-01T00:00:00.000Z",
  "updatedAt": "2024-02-01T00:00:00.000Z"
}
```

**❌ Réponses d'Erreur**

| Status | Body                      |
| ------ | ------------------------- |
| 400    | Erreur de validation      |
| 500    | Erreur interne du serveur |

---

#### 🔹 GET /services

Obtenir tous les services avec pagination.

|                 |                          |
| --------------- | ------------------------ |
| **Description** | Lister tous les services |
| **Auth requis** | ❌ **NON PROTÉGÉ**       |
| **Rôle requis** | -                        |

**📥 Requête**

Paramètres Query:

```
?page=1&pageSize=10&workerId=uuid-du-worker (optionnel)
```

**📤 Réponse Succès**

Status: `200 OK`

```json
{
  "services": [
    {
      "id": "uuid-string",
      "title": "Réparation de Plomberie",
      "description": "Services professionnels de réparation de plomberie",
      "minPrice": 50,
      "maxPrice": 200,
      "workerId": "uuid-du-worker",
      "createdAt": "2024-02-01T00:00:00.000Z",
      "updatedAt": "2024-02-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

#### 🔹 GET /services/:id

Obtenir un service par ID.

|                 |                                  |
| --------------- | -------------------------------- |
| **Description** | Obtenir les détails d'un service |
| **Auth requis** | ❌ **NON PROTÉGÉ**               |
| **Rôle requis** | -                                |

**📥 Requête**

Params:

```
:id = uuid-string
```

**📤 Réponse Succès**

Status: `200 OK`

```json
{
  "id": "uuid-string",
  "title": "Réparation de Plomberie",
  "description": "Services professionnels de réparation de plomberie",
  "minPrice": 50,
  "maxPrice": 200,
  "workerId": "uuid-du-worker",
  "createdAt": "2024-02-01T00:00:00.000Z",
  "updatedAt": "2024-02-01T00:00:00.000Z"
}
```

---

#### 🔹 PUT /services/:id

Mettre à jour un service.

|                 |                                        |
| --------------- | -------------------------------------- |
| **Description** | Mettre à jour les détails d'un service |
| **Auth requis** | ❌ **NON PROTÉGÉ**                     |
| **Rôle requis** | -                                      |

**📥 Requête**

Params:

```
:id = uuid-string
```

Body:

```json
{
  "title": "Titre Mis à Jour",
  "description": "Description mise à jour",
  "minPrice": 75,
  "maxPrice": 250,
  "workerId": "uuid-du-worker"
}
```

**📤 Réponse Succès**

Status: `200 OK`

```json
{
  "id": "uuid-string",
  "title": "Titre Mis à Jour",
  "description": "Description mise à jour",
  "minPrice": 75,
  "maxPrice": 250,
  "workerId": "uuid-du-worker",
  "createdAt": "2024-02-01T00:00:00.000Z",
  "updatedAt": "2024-02-02T00:00:00.000Z"
}
```

---

#### 🔹 DELETE /services/:id

Supprimer un service.

|                 |                      |
| --------------- | -------------------- |
| **Description** | Supprimer un service |
| **Auth requis** | ❌ **NON PROTÉGÉ**   |
| **Rôle requis** | -                    |

**📥 Requête**

Params:

```
:id = uuid-string
```

Body:

```json
{
  "workerId": "uuid-du-worker"
}
```

**📤 Réponse Succès**

Status: `200 OK`

```json
{
  "message": "Service deleted successfully"
}
```

---

### 📌 HEALTH CHECK (`/health`)

#### 🔹 GET /health

Endpoint de vérification de santé.

|                 |                            |
| --------------- | -------------------------- |
| **Description** | Vérifier la santé de l'API |
| **Auth requis** | Non                        |
| **Rôle requis** | -                          |

**📤 Réponse Succès**

Status: `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2024-02-01T00:00:00.000Z"
}
```

---

## 4️⃣ Règles Métier Importantes

### ✅ Règles de Sécurité

| Règle                            | Description                                                                 |
| -------------------------------- | --------------------------------------------------------------------------- |
| **ADMIN via seed uniquement**    | Le rôle ADMIN peut UNIQUEMENT être créé via le script seed de Prisma        |
| **Inscription force CLIENT**     | Toutes les nouvelles inscriptions obtiennent automatiquement le rôle CLIENT |
| **Mot de passe jamais retourné** | Le champ mot de passe n'est jamais inclus dans les réponses API             |
| **Rôle depuis JWT**              | Le rôle est TOUJOURS extrait du token JWT vérifié, jamais du client         |
| **Erreurs génériques d'auth**    | Les erreurs de connexion sont génériques pour éviter l'énumération          |

### ✅ Règles Métier

| Règle                      | Description                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| **Statut Worker**          | Les workers peuvent avoir le statut : PENDING, ACTIVE, REJECTED            |
| **Validation service**     | Titre min 3 caractères, description min 10 caractères, validation des prix |
| **Email unique**           | L'email doit être unique pour tous les utilisateurs                        |
| **Exigences mot de passe** | Min 8 caractères, au moins une lettre et un chiffre                        |

### ⚠️ Problèmes Identifiés

| Problème                              | Sévérité    | Description                                                     |
| ------------------------------------- | ----------- | --------------------------------------------------------------- |
| **Routes utilisateurs non protégées** | 🔴 CRITIQUE | Tous les endpoints `/users` n'ont pas d'authentification        |
| **Routes services non protégées**     | 🔴 CRITIQUE | Tous les endpoints `/services` n'ont pas d'authentification     |
| **Pas d'autorisation**                | 🔴 CRITIQUE | Pas de contrôle d'accès basé sur les rôles                      |
| **Pas de rate limiting**              | 🟠 HAUT     | Pas de limitation de taux configurée malgré la config existante |

---

## 5️⃣ Flow Complet de Test sur Postman

### Étape 1 : Seed la Base de Données (Créer Admin)

```bash
npm run prisma:seed
```

Ceci crée :

- Utilisateur Admin : admin@samaouvrier.com / Admin@2024!Secure

### Étape 2 : Se Connecter en Tant qu'Admin

```
POST /auth/login
Body:
{
  "email": "admin@samaouvrier.com",
  "password": "Admin@2024!Secure"
}
```

Sauvegarder le `token` de la réponse.

### Étape 3 : S'inscrire en Tant que Client

```
POST /auth/register
Body:
{
  "email": "client@exemple.com",
  "password": "motdepasse123",
  "name": "Jean Client"
}
```

### Étape 4 : Tester la Route Protégée

```
GET /auth/me
Headers:
  Authorization: Bearer <TOKEN_CLIENT>
```

### Étape 5 : Tester l'Accès Basé sur les Rôles

Essayer d'accéder à `/users` avec différents tokens pour vérifier l'application des rôles.

### Checklist de Test Complète

- [ ] POST /auth/register - Créer un nouvel utilisateur
- [ ] POST /auth/login - Se connecter et obtenir le token
- [ ] GET /auth/me - Obtenir l'utilisateur actuel
- [ ] GET /health - Vérification de santé
- [ ] POST /users - Créer un utilisateur (non protégé !)
- [ ] GET /users - Lister les utilisateurs (non protégé !)
- [ ] GET /users/:id - Obtenir un utilisateur (non protégé !)
- [ ] PUT /users/:id - Mettre à jour un utilisateur (non protégé !)
- [ ] DELETE /users/:id - Supprimer un utilisateur (non protégé !)
- [ ] POST /services - Créer un service (non protégé !)
- [ ] GET /services - Lister les services (non protégé !)
- [ ] GET /services/:id - Obtenir un service (non protégé !)
- [ ] PUT /services/:id - Mettre à jour un service (non protégé !)
- [ ] DELETE /services/:id - Supprimer un service (non protégé !)

---

## 6️⃣ Données Seed Nécessaires

### Utilisateur Admin (Pré-créé)

| Champ        | Valeur                |
| ------------ | --------------------- |
| Email        | admin@samaouvrier.com |
| Mot de passe | Admin@2024!Secure     |
| Rôle         | ADMIN                 |
| Nom          | Super Admin           |

### Professions (Pré-créées)

1. Plumber (Plombier)
2. Electrician (Électricien)
3. Carpenter (Menuisier)
4. Painter (Peintre)
5. Mason (Maçon)
6. Welder (Soudeur)
7. Gardener (Jardinier)
8. Cleaner (Nettoyeur)
9. Mechanic (Mécanicien)
10. AC Technician (Technicien Climatisation)

### Commande Seed

```bash
npm run prisma:seed
```

---

## 7️⃣ Structure des Réponses Standardisées

### Format Succès

```json
{
  "user": { ... },
  "token": "..."
}
```

### Format Erreur

```json
{
  "error": "Message d'erreur"
}
```

### Format Pagination

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 8️⃣ Problèmes de Sécurité Identifiés

### 🔴 CRITIQUE : Routes Non Protégées

**TOUTES les routes `/users` et `/services` sont complètement non protégées !**

#### Impact :

- N'importe qui peut créer, lire, mettre à jour, supprimer n'importe quel utilisateur
- N'importe qui peut créer, lire, mettre à jour, supprimer n'importe quel service
- Pas d'authentification requise
- Pas de vérification d'autorisation

#### Correction Requise :

1. **Ajouter le middleware d'authentification à toutes les routes :**

```typescript
// Exemple de correction pour les routes utilisateur
import { authenticate } from "../shared/middleware/authenticate.middleware.js";
import { authorize } from "../shared/middleware/authorize.middleware.js";

router.post("/", authenticate, authorize("ADMIN"), userController.create);
router.get("/", authenticate, authorize("ADMIN"), userController.getAll);
router.get("/:id", authenticate, authorize("ADMIN"), userController.getById);
router.put("/:id", authenticate, authorize("ADMIN"), userController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), userController.delete);
```

2. **Ajouter l'authentification aux routes de services :**

```typescript
router.post(
  "/",
  authenticate,
  authorize("WORKER", "ADMIN"),
  serviceController.create,
);
router.get("/", authenticate, serviceController.getAll);
// etc.
```

### 🟠 HAUT : Rate Limiting Non Actif

Le rate limiting est configuré mais pas appliqué aux routes.

### 🟡 MOYEN : Pas de Sanitization des Entrées

Bien que Zod valide le format, il n'y a pas de protection XSS sur les champs texte.

---

## 📊 Tableau Récapitulatif

| Endpoint       | Méthode | Auth | Rôle Requis      | Statut         |
| -------------- | ------- | ---- | ---------------- | -------------- |
| /auth/register | POST    | ❌   | -                | ✅ Sécurisé    |
| /auth/login    | POST    | ❌   | -                | ✅ Sécurisé    |
| /auth/me       | GET     | ✅   | N'importe lequel | ✅ Sécurisé    |
| /users         | POST    | ❌   | -                | 🔴 NON PROTÉGÉ |
| /users         | GET     | ❌   | -                | 🔴 NON PROTÉGÉ |
| /users/:id     | GET     | ❌   | -                | 🔴 NON PROTÉGÉ |
| /users/:id     | PUT     | ❌   | -                | 🔴 NON PROTÉGÉ |
| /users/:id     | DELETE  | ❌   | -                | 🔴 NON PROTÉGÉ |
| /services      | POST    | ❌   | -                | 🔴 NON PROTÉGÉ |
| /services      | GET     | ❌   | -                | 🔴 NON PROTÉGÉ |
| /services/:id  | GET     | ❌   | -                | 🔴 NON PROTÉGÉ |
| /services/:id  | PUT     | ❌   | -                | 🔴 NON PROTÉGÉ |
| /services/:id  | DELETE  | ❌   | -                | 🔴 NON PROTÉGÉ |
| /health        | GET     | ❌   | -                | ✅ OK          |

---

_Document généré à partir de l'analyse du code source. Dernière mise à jour : 2024-02-01_
