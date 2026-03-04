import type { Request, Response, NextFunction } from 'express';
/**
 * Mission Controller
 *
 * Utilise les fonctions fléchées pour éviter les problèmes de binding
 */
export declare const missionController: {
    /**
     * Crée une nouvelle mission
     * POST /missions
     *
     * @requires Authentication (CLIENT only)
     */
    create: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Liste les missions avec pagination
     * GET /missions
     *
     * Filtrage basé sur le rôle de l'utilisateur:
     * - CLIENT → voit uniquement ses missions (clientId = user.id)
     * - WORKER → voit uniquement ses missions (workerId = user.id)
     * - ADMIN → voit toutes les missions
     */
    list: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Récupère une mission par ID
     * GET /missions/:id
     *
     * @requires Authentication + ownership check
     */
    getById: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Confirme le paiement initial
     * POST /missions/:id/confirm-initial-payment
     *
     * @requires Authentication
     * Note: Cette endpoint est appelée par le webhook du système de paiement externe
     */
    confirmInitialPayment: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Le worker accepte la mission
     * POST /missions/:id/accept
     *
     * @requires Authentication (WORKER only)
     */
    accept: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Le worker refuse la mission
     * POST /missions/:id/refuse
     *
     * @requires Authentication (WORKER only)
     */
    refuse: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Fixe le prix final après négociation
     * POST /missions/:id/set-final-price
     *
     * @requires Authentication
     */
    setFinalPrice: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Confirme le paiement final
     * POST /missions/:id/confirm-final-payment
     *
     * @requires Authentication
     * Note: Cette endpoint est appelée par le webhook du système de paiement externe
     */
    confirmFinalPayment: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Marque la mission comme terminée (double confirmation)
     * POST /missions/:id/complete
     *
     * @requires Authentication
     */
    complete: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Demande l'annulation d'une mission en cours
     * POST /missions/:id/request-cancellation
     *
     * @requires Authentication
     */
    requestCancellation: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Traite une demande d'annulation (approuve ou rejette)
     * POST /missions/:id/process-cancellation
     *
     * @requires Authentication
     */
    processCancellation: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Annule une mission (pour les statuts permettant une annulation directe)
     * POST /missions/:id/cancel
     *
     * @requires Authentication
     */
    cancel: (req: Request, res: Response, next: NextFunction) => void;
};
//# sourceMappingURL=mission.controller.d.ts.map