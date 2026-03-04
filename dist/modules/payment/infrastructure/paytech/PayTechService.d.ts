/**
 * Configuration PayTech
 */
export interface PayTechConfig {
    apiKey: string;
    apiSecret: string;
    baseUrl: string;
    env: 'test' | 'production';
    ipnUrl: string;
    successUrl: string;
    cancelUrl: string;
}
/**
 * Payload pour créer un paiement PayTech
 */
export interface CreatePaymentPayload {
    item_name: string;
    item_price: number;
    currency: string;
    ref_command: string;
    command_name: string;
    env: string;
    ipn_url: string;
    success_url: string;
    cancel_url: string;
    custom_field?: Record<string, unknown>;
}
/**
 * Réponse de l'API PayTech
 */
export interface PayTechResponse {
    success: boolean;
    message?: string;
    data?: {
        payment_url?: string;
        token?: string;
        ref_command?: string;
    };
    errors?: Record<string, string[]>;
}
/**
 * Payload du webhook PayTech (IPN)
 */
export interface PayTechWebhookPayload {
    ref_command: string;
    token: string;
    amount: string;
    currency: string;
    status: string;
    payment_method?: string;
    phone_number?: string;
    operator?: string;
    custom_field?: Record<string, unknown>;
}
/**
 * Résultat de la vérification de signature
 */
export interface SignatureVerification {
    isValid: boolean;
    error?: string;
}
/**
 * PayTech Service
 *
 * RESPONSABILITÉS:
 * - Créer des demandes de paiement
 * - Vérifier les signatures webhook
 * - Gérer les réponses de l'API
 * - Simuler les opérations en mode sandbox
 */
export declare class PayTechService {
    private readonly config;
    private readonly isSandbox;
    constructor(config: PayTechConfig);
    /**
     * Crée une demande de paiement PayTech
     *
     * @param amount - Montant en XOF
     * @param idempotencyKey - Clé d'idempotence unique
     * @param itemName - Description du paiement
     * @param customField - Données personnalisées
     * @returns URL de paiement PayTech
     */
    createPaymentRequest(amount: number, idempotencyKey: string, itemName: string, customField?: Record<string, unknown>): Promise<string>;
    /**
     * Vérifie la signature d'un webhook PayTech
     *
     * @param payload - Corps du webhook
     * @param signature - Signature à vérifier
     */
    verifyWebhookSignature(payload: string, signature: string): SignatureVerification;
    /**
     * Traite un webhook PayTech (IPN)
     *
     * @param payload - Données du webhook
     * @returns Statut du paiement
     */
    processWebhook(payload: PayTechWebhookPayload): {
        status: 'SUCCESS' | 'FAILED' | 'PENDING';
        refCommand: string;
        amount: number;
    };
    /**
     * Effectue un remboursement via PayTech
     *
     * @param amount - Montant à rembourser
     * @param refCommand - Référence de la transaction originale
     * @returns Succès de l'opération
     */
    refund(amount: number, refCommand: string): Promise<boolean>;
    /**
     * Simule une demande de paiement en mode sandbox
     */
    private simulatePaymentRequest;
    /**
     * Appelle l'API PayTech
     */
    private callPayTechApi;
    /**
     * Génère une clé d'idempotence
     */
    generateIdempotencyKey(prefix: string): string;
}
/**
 * Crée le service PayTech depuis la configuration
 */
export declare function createPayTechService(): PayTechService;
//# sourceMappingURL=PayTechService.d.ts.map