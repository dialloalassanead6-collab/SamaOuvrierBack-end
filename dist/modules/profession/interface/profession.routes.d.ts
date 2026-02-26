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
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de la profession
 *                 example: "Electricien"
 *               description:
 *                 type: string
 *                 description: Description de la profession
 *                 example: "Specialiste des installations electriques"
 *     responses:
 *       201:
 *         description: Profession creee
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Profession'
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Profession'
 *
 * /professions/{id}:
 *   patch:
 *     summary: Modifier une profession
 *     description: Met a jour les informations d'une profession (admin uniquement)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de la profession
 *               description:
 *                 type: string
 *                 description: Description de la profession
 *     responses:
 *       200:
 *         description: Profession mise a jour
 *       400:
 *         description: Donnees invalides
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse (pas admin)
 *       404:
 *         description: Profession introuvable
 *       409:
 *         description: Profession deja existante
 *
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