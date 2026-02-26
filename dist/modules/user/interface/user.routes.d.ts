/**
 * @swagger
 * /users:
 *   post:
 *     summary: Creer un nouvel utilisateur
 *     description: Cree un nouvel utilisateur (admin uniquement)
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Utilisateur cree
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Donnees invalides
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse
 *
 *   get:
 *     summary: Liste des utilisateurs
 *     description: Recupere la liste de tous les utilisateurs (admin uniquement)
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero de page
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'elements par page
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse
 *
 * /users/{id}:
 *   get:
 *     summary: Obtenir un utilisateur par ID
 *     description: Recupere les details d'un utilisateur par son ID (admin uniquement)
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouve
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse
 *       404:
 *         description: Utilisateur introuvable
 *
 *   put:
 *     summary: Modifier un utilisateur
 *     description: Met a jour les informations d'un utilisateur (admin uniquement)
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Utilisateur mis a jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Donnees invalides
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse
 *       404:
 *         description: Utilisateur introuvable
 *
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Supprime un utilisateur (admin uniquement)
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprime
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse
 *       404:
 *         description: Utilisateur introuvable
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=user.routes.d.ts.map