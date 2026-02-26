// ============================================================================
// MODULE PROFESSION - Routes et Controller
// ============================================================================
// Gestion des professions (ADMIN uniquement)
// ============================================================================
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
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
const router = Router();
// GET /professions - Get all professions
router.get('/', async (_req, res, next) => {
    try {
        const professions = await prisma.profession.findMany({
            orderBy: { name: 'asc' },
        });
        res.json({
            success: true,
            message: 'Professions recuperees avec succes.',
            data: professions,
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /professions - Create a profession (admin only)
router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const profession = await prisma.profession.create({
            data: { name, description },
        });
        res.status(201).json({
            success: true,
            message: 'Profession creee avec succes.',
            data: profession,
        });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /professions/:id - Delete a profession (admin only)
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.profession.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Profession supprimee avec succes.',
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=profession.routes.js.map