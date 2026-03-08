# Analyse Swagger/OpenAPI - Projet SamaOuvrier

## Résumé de l'analyse

J'ai analysé le swagger généré dynamiquement par votre application (`http://localhost:3000/docs.json`) et comparé avec les fichiers de code sources.

---

## ✅ CE QUI FONCTIONNE - Routes présentes dans le Swagger

### 1. Authentification (3 routes)

| Route            | Méthode | Description                 |
| ---------------- | ------- | --------------------------- |
| `/auth/register` | POST    | Inscription client/worker   |
| `/auth/login`    | POST    | Connexion utilisateur       |
| `/auth/me`       | GET     | Profil utilisateur connecté |

### 2. Workers (6 routes) ✅

| Route                          | Méthode | Description                          |
| ------------------------------ | ------- | ------------------------------------ |
| `/workers/public`              | GET     | Liste workers publics (avec filtres) |
| `/workers/{workerId}/services` | GET     | Services d'un worker                 |
| `/workers/me`                  | GET     | Mon profil worker                    |
| `/workers/me/missions`         | GET     | Mes missions                         |
| `/workers/me/services`         | GET     | Mes services                         |
| `/workers/me/reapply`          | PATCH   | Repostuler comme worker              |

### 3. Professions (4 routes) ✅

| Route               | Méthode | Description                      |
| ------------------- | ------- | -------------------------------- |
| `/professions`      | GET     | Liste des professions            |
| `/professions`      | POST    | Créer une profession (admin)     |
| `/professions/{id}` | PATCH   | Modifier une profession (admin)  |
| `/professions/{id}` | DELETE  | Supprimer une profession (admin) |

### 4. Missions (13 routes)

| Route                                    | Méthode | Description                |
| ---------------------------------------- | ------- | -------------------------- |
| `/missions`                              | POST    | Créer une mission          |
| `/missions`                              | GET     | Liste des missions         |
| `/missions/{id}`                         | GET     | Détails d'une mission      |
| `/missions/{id}/accept`                  | POST    | Accepter la mission        |
| `/missions/{id}/refuse`                  | POST    | Refuser la mission         |
| `/missions/{id}/confirm-initial-payment` | POST    | Confirmer paiement initial |
| `/missions/{id}/set-final-price`         | POST    | Fixer le prix final        |
| `/missions/{id}/confirm-final-payment`   | POST    | Confirmer paiement final   |
| `/missions/{id}/complete`                | POST    | Terminer la mission        |
| `/missions/{id}/request-cancellation`    | POST    | Demander annulation        |
| `/missions/{id}/process-cancellation`    | POST    | Traiter annulation (admin) |
| `/missions/{id}/cancel`                  | POST    | Annuler la mission         |

### 5. Dashboard (3 routes)

| Route               | Méthode | Description  |
| ------------------- | ------- | ------------ |
| `/dashboard/admin`  | GET     | Stats admin  |
| `/dashboard/worker` | GET     | Stats worker |
| `/dashboard/client` | GET     | Stats client |

### 6. Disputes (7 routes)

| Route                                   | Méthode | Description           |
| --------------------------------------- | ------- | --------------------- |
| `/disputes`                             | POST    | Créer une dispute     |
| `/disputes`                             | GET     | Liste des disputes    |
| `/disputes/my`                          | GET     | Mes disputes          |
| `/disputes/{id}`                        | GET     | Détails d'une dispute |
| `/disputes/{id}/evidence`               | POST    | Ajouter une preuve    |
| `/disputes/{id}/evidences/{evidenceId}` | DELETE  | Supprimer une preuve  |
| `/disputes/{id}/review`                 | PATCH   | Mettre en examen      |
| `/disputes/{id}/resolve`                | PATCH   | Résoudre la dispute   |

### 7. Notifications (5 routes)

| Route                         | Méthode | Description                    |
| ----------------------------- | ------- | ------------------------------ |
| `/notifications`              | GET     | Liste des notifications        |
| `/notifications`              | POST    | Créer une notification (admin) |
| `/notifications/unread-count` | GET     | Nombre non lus                 |
| `/notifications/{id}/read`    | PATCH   | Marquer comme lu               |
| `/notifications/read-all`     | PATCH   | Tout marquer comme lu          |
| `/notifications/{id}`         | DELETE  | Supprimer une notification     |

### 8. Services (4 routes)

| Route            | Méthode | Description          |
| ---------------- | ------- | -------------------- |
| `/services`      | POST    | Créer un service     |
| `/services`      | GET     | Liste des services   |
| `/services/{id}` | GET     | Détails d'un service |
| `/services/{id}` | PUT     | Modifier un service  |
| `/services/{id}` | DELETE  | Supprimer un service |

### 9. Utilisateurs (8 routes)

| Route                   | Méthode | Description                               |
| ----------------------- | ------- | ----------------------------------------- |
| `/users`                | POST    | Créer un utilisateur (admin)              |
| `/users`                | GET     | Liste des utilisateurs (admin)            |
| `/users/{id}`           | GET     | Détails d'un utilisateur (admin)          |
| `/users/{id}`           | PUT     | Modifier un utilisateur (admin)           |
| `/users/{id}`           | DELETE  | Supprimer un utilisateur (admin)          |
| `/users/me/activation`  | PATCH   | Activer/désactiver mon compte             |
| `/users/:id/activation` | PATCH   | Activer/désactiver un utilisateur (admin) |
| `/users/:id/ban`        | PATCH   | Bannir/débannir un utilisateur (admin)    |

### 10. Admin (9 routes)

| Route                          | Méthode | Description                |
| ------------------------------ | ------- | -------------------------- |
| `/admin/workers`               | GET     | Liste des workers (admin)  |
| `/admin/workers/{id}/approve`  | PATCH   | Approuver un worker        |
| `/admin/workers/{id}/reject`   | PATCH   | Rejeter un worker          |
| `/admin/users/{id}/activate`   | PATCH   | Activer un utilisateur     |
| `/admin/users/{id}/deactivate` | PATCH   | Désactiver un utilisateur  |
| `/admin/users/{id}/ban`        | PATCH   | Bannir un utilisateur      |
| `/admin/users/{id}/unban`      | PATCH   | Débannir un utilisateur    |
| `/admin/users/{id}`            | DELETE  | Soft delete un utilisateur |
| `/admin/users/{id}/restore`    | PATCH   | Restaurer un utilisateur   |

---

## ❌ CE QUI NE FONCTIONNE PAS - Routes SANS annotations @swagger

### 1. Routes Payments - COMPLETEMENT ABSENTES ❌

Ces routes existent dans le code ([`src/modules/payment/interface/payment.routes.ts`](src/modules/payment/interface/payment.routes.ts:1)) mais n'ont PAS d'annotations `@swagger` :

| Route                           | Méthode | Description                   |
| ------------------------------- | ------- | ----------------------------- |
| `/payments`                     | POST    | Créer un paiement             |
| `/payments/callback`            | POST    | Webhook PayTech (IPN)         |
| `/payments/{missionId}`         | GET     | Obtenir le statut du paiement |
| `/payments/{missionId}/release` | POST    | Libérer l'escrow              |
| `/payments/{missionId}/cancel`  | POST    | Annuler le paiement           |

**Cause** : Les routes utilisent des commentaires JS normaux (`//`) au lieu d'annotations `@swagger`

### 2. Routes Reviews - COMPLETEMENT ABSENTES ❌

Ces routes existent dans le code ([`src/modules/review/interface/review.routes.ts`](src/modules/review/interface/review.routes.ts:1)) mais n'ont PAS d'annotations `@swagger` :

| Route                                | Méthode | Description               |
| ------------------------------------ | ------- | ------------------------- |
| `/reviews`                           | POST    | Créer un avis             |
| `/reviews/workers/:workerId/reviews` | GET     | Avis d'un worker          |
| `/reviews/{id}`                      | DELETE  | Supprimer un avis (admin) |

**Cause** : Les routes utilisent des commentaires JS normaux (`/** */`) mais sans la syntaxe `@swagger`

---

## 🔧 AMÉLIORATIONS RECOMMANDÉES

### Priorité HAUTE - Ajouter les annotations @swagger

#### 1. Fichier [`src/modules/payment/interface/payment.routes.ts`](src/modules/payment/interface/payment.routes.ts:1)

Ajouter les annotations @swagger pour chaque route :

```typescript
/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Créer un paiement
 *     description: Crée un nouveau paiement pour une mission et retourne l'URL PayTech
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - missionId
 *             properties:
 *               missionId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Paiement créé
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /payments/callback:
 *   post:
 *     summary: Webhook PayTech
 *     description: Endpoint de callback pour les notifications de paiement PayTech (IPN)
 *     tags:
 *       - Payments
 *     responses:
 *       200:
 *         description:Webhook traité
 */

/**
 * @swagger
 * /payments/{missionId}:
 *   get:
 *     summary: Obtenir le statut du paiement
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statut du paiement
 */

/**
 * @swagger
 * /payments/{missionId}/release:
 *   post:
 *     summary: Libérer l'escrow
 *     tags:
 *       - Payments
 *       - Escrow
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Escrow libéré
 */

/**
 * @swagger
 * /payments/{missionId}/cancel:
 *   post:
 *     summary: Annuler le paiement
 *     tags:
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Paiement annulé
 */
```

#### 2. Fichier [`src/modules/review/interface/review.routes.ts`](src/modules/review/interface/review.routes.ts:1)

Ajouter les annotations @swagger :

```typescript
/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Créer un avis
 *     description: Crée un nouvel avis pour une mission complétée
 *     tags:
 *       - Reviews
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - missionId
 *               - rating
 *             properties:
 *               missionId:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Avis créé
 */

/**
 * @swagger
 * /reviews/workers/{workerId}/reviews:
 *   get:
 *     summary: Liste des avis d'un worker
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des avis
 */

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Supprimer un avis
 *     description: Supprime un avis (admin uniquement)
 *     tags:
 *       - Reviews
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Avis supprimé
 *       403:
 *         description: Accès refusé (admin uniquement)
 */
```

---

## 📊 Statistiques

| Métrique                 | Valeur |
| ------------------------ | ------ |
| Total routes documentées | ~60    |
| Routes avec @swagger     | ~52    |
| Routes sans @swagger     | 8      |

---

## 🎯 Plan d'action

1. **Ajouter @swagger dans `payment.routes.ts`** (5 routes)
2. **Ajouter @swagger dans `review.routes.ts`** (3 routes)
3. **Regénérer le swagger** en redémarrant le serveur
4. **Vérifier** sur `http://localhost:3000/docs`

Après ces modifications, votre swagger sera COMPLET et PROPRE.
