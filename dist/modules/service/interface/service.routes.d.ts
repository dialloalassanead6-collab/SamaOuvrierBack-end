/**
 * @swagger
 * /services:
 *   post:
 *     summary: Creer un nouveau service
 *     description: Cree un nouveau service propose par un worker
 *     tags:
 *       - Services
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServiceRequest'
 *           example:
 *             title: "Installation plomberie"
 *             description: "Installation complete de plomberie pour maison"
 *             minPrice: 50000
 *             maxPrice: 500000
 *             workerId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *     responses:
 *       201:
 *         description: Service cree
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Donnees invalides
 *       401:
 *         description: Non authentifie
 *
 *   get:
 *     summary: Liste des services
 *     description: Recupere la liste des services avec pagination optionnelle
 *     tags:
 *       - Services
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
 *       - in: query
 *         name: workerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par worker (optionnel)
 *     responses:
 *       200:
 *         description: Liste des services
 *       401:
 *         description: Non authentifie
 *
 * /services/{id}:
 *   get:
 *     summary: Obtenir un service par ID
 *     description: Recupere les details d'un service par son ID
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du service
 *     responses:
 *       200:
 *         description: Service trouve
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       401:
 *         description: Non authentifie
 *       404:
 *         description: Service introuvable
 *
 *   put:
 *     summary: Modifier un service
 *     description: Met a jour les informations d'un service
 *     tags:
 *       - Services
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateServiceRequest'
 *     responses:
 *       200:
 *         description: Service mis a jour
 *       400:
 *         description: Donnees invalides (workerId requis)
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse (pas le proprietaire)
 *       404:
 *         description: Service introuvable
 *
 *   delete:
 *     summary: Supprimer un service
 *     description: Supprime un service (proprietaire uniquement)
 *     tags:
 *       - Services
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du service
 *     responses:
 *       200:
 *         description: Service supprime
 *       400:
 *         description: Donnees invalides (workerId requis)
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse
 *       404:
 *         description: Service introuvable
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=service.routes.d.ts.map