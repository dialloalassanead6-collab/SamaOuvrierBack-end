/**
 * @swagger
 * /professions:
 *   post:
 *     summary: Creer une nouvelle profession
 *     description: Cree une nouvelle profession (admin uniquement)
 *     tags:
 *       - Professions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProfessionRequest'
 *           example:
 *             name: "Electricien"
 *             description: "Specialiste des installations electriques"
 *     responses:
 *       201:
 *         description: Profession creee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profession'
 *             example:
 *               id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *               name: "Electricien"
 *               description: "Specialiste des installations electriques"
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Donnees invalides
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse (pas admin)
 *       409:
 *         description: Profession deja existante
 *
 *   get:
 *     summary: Liste des professions
 *     description: Recupere la liste de toutes les professions
 *     tags:
 *       - Professions
 *     responses:
 *       200:
 *         description: Liste des professions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profession'
 *
 * /professions/{id}:
 *   delete:
 *     summary: Supprimer une profession
 *     description: Supprime une profession par son ID (admin uniquement)
 *     tags:
 *       - Professions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la profession
 *     responses:
 *       200:
 *         description: Profession supprimee
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse (pas admin)
 *       404:
 *         description: Profession introuvable
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=profession.routes.d.ts.map