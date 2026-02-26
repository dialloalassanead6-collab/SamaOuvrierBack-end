// Interface Layer - Profession Routes
// Handles HTTP routing for profession endpoints
import { Router } from 'express';
import { Role } from '@prisma/client';
import { professionController } from './profession.controller.js';
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js';
import { authorize } from '../../../shared/middleware/authorize.middleware.js';
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
const router = Router();
// POST /professions - Create a profession (ADMIN only)
router.post('/', authenticate(), authorize(Role.ADMIN), professionController.create);
// GET /professions - Get all professions (Public)
router.get('/', professionController.list);
// PATCH /professions/:id - Update a profession (ADMIN only)
router.patch('/:id', authenticate(), authorize(Role.ADMIN), professionController.update);
// DELETE /professions/:id - Delete a profession (ADMIN only)
router.delete('/:id', authenticate(), authorize(Role.ADMIN), professionController.delete);
export default router;
//# sourceMappingURL=profession.routes.js.map