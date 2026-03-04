// ============================================================================
// PAYTECH SERVICE - INFRASTRUCTURE LAYER
// ============================================================================
// Service d'intégration avec l'API PayTech pour les paiements
// Mode Sandbox/Test pour les environnements de développement
// ============================================================================
import crypto from 'crypto';
/**
 * PayTech Service
 *
 * RESPONSABILITÉS:
 * - Créer des demandes de paiement
 * - Vérifier les signatures webhook
 * - Gérer les réponses de l'API
 * - Simuler les opérations en mode sandbox
 */
export class PayTechService {
    config;
    isSandbox;
    constructor(config) {
        this.config = config;
        this.isSandbox = config.env === 'test';
    }
    // ============================================================================
    // OPÉRATIONS DE PAIEMENT
    // ============================================================================
    /**
     * Crée une demande de paiement PayTech
     *
     * @param amount - Montant en XOF
     * @param idempotencyKey - Clé d'idempotence unique
     * @param itemName - Description du paiement
     * @param customField - Données personnalisées
     * @returns URL de paiement PayTech
     */
    async createPaymentRequest(amount, idempotencyKey, itemName, customField) {
        const payload = {
            item_name: itemName,
            item_price: amount,
            currency: 'XOF',
            ref_command: idempotencyKey,
            command_name: `Paiement mission ${itemName}`,
            env: this.config.env,
            ipn_url: this.config.ipnUrl,
            success_url: this.config.successUrl,
            cancel_url: this.config.cancelUrl,
        };
        if (customField && Object.keys(customField).length > 0) {
            payload.custom_field = customField;
        }
        // En mode sandbox, on simule la réponse
        if (this.isSandbox) {
            return this.simulatePaymentRequest(payload);
        }
        // En mode production, appeler l'API PayTech
        return this.callPayTechApi(payload);
    }
    /**
     * Vérifie la signature d'un webhook PayTech
     *
     * @param payload - Corps du webhook
     * @param signature - Signature à vérifier
     */
    verifyWebhookSignature(payload, signature) {
        try {
            // Calculer la signature attendue
            const expectedSignature = crypto
                .createHmac('sha512', this.config.apiSecret)
                .update(payload)
                .digest('hex');
            // Comparer les signatures
            const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
            return { isValid };
        }
        catch (error) {
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Erreur de vérification de signature',
            };
        }
    }
    /**
     * Traite un webhook PayTech (IPN)
     *
     * @param payload - Données du webhook
     * @returns Statut du paiement
     */
    processWebhook(payload) {
        // Mapper le statut PayTech vers notre statut interne
        const statusMap = {
            '000': 'SUCCESS', // Paiement réussi
            '001': 'FAILED', // Paiement échoué
            '002': 'PENDING', // En attente
        };
        const status = statusMap[payload.status] || 'PENDING';
        return {
            status,
            refCommand: payload.ref_command,
            amount: parseFloat(payload.amount),
        };
    }
    /**
     * Effectue un remboursement via PayTech
     *
     * @param amount - Montant à rembourser
     * @param refCommand - Référence de la transaction originale
     * @returns Succès de l'opération
     */
    async refund(amount, refCommand) {
        // En mode sandbox, toujours réussi
        if (this.isSandbox) {
            console.log(`[PayTech Sandbox] Refund de ${amount} XOF pour ${refCommand}`);
            return true;
        }
        // En production, appeler l'API PayTech
        try {
            const refundPayload = {
                item_name: 'Remboursement',
                item_price: amount,
                currency: 'XOF',
                ref_command: `refund-${refCommand}-${Date.now()}`,
                command_name: 'Remboursement',
                env: this.config.env,
                ipn_url: this.config.ipnUrl,
                success_url: this.config.successUrl,
                cancel_url: this.config.cancelUrl,
            };
            const response = await this.callPayTechApi(refundPayload);
            return response === 'success';
        }
        catch (error) {
            console.error('Erreur PayTech refund:', error);
            return false;
        }
    }
    // ============================================================================
    // MÉTHODES PRIVÉES
    // ============================================================================
    /**
     * Simule une demande de paiement en mode sandbox
     */
    simulatePaymentRequest(payload) {
        // Générer un token simulé
        const token = crypto.randomUUID();
        const simulatedUrl = `${this.config.baseUrl}/payment/${token}?amount=${payload.item_price}&ref=${payload.ref_command}`;
        console.log(`[PayTech Sandbox] Payment request:`, {
            amount: payload.item_price,
            ref: payload.ref_command,
            itemName: payload.item_name,
            url: simulatedUrl,
        });
        return simulatedUrl;
    }
    /**
     * Appelle l'API PayTech
     */
    async callPayTechApi(payload) {
        const headers = {
            'Content-Type': 'application/json',
            'Api-Key': this.config.apiKey,
        };
        const response = await fetch(`${this.config.baseUrl}/payment/request-payment`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`PayTech API error: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success || !data.data?.payment_url) {
            throw new Error(data.message || 'Erreur PayTech');
        }
        return data.data.payment_url;
    }
    /**
     * Génère une clé d'idempotence
     */
    generateIdempotencyKey(prefix) {
        return `${prefix}-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;
    }
}
// ============================================================================
// FACTORY FUNCTION
// ============================================================================
/**
 * Crée le service PayTech depuis la configuration
 */
export function createPayTechService() {
    const config = {
        apiKey: process.env.PAYTECH_API_KEY || '',
        apiSecret: process.env.PAYTECH_API_SECRET || '',
        baseUrl: process.env.PAYTECH_BASE_URL || 'https://sandbox.paytech.sn/api',
        env: process.env.PAYTECH_ENV || 'test',
        ipnUrl: process.env.PAYTECH_IPN_URL || 'https://ton-backend/api/payments/callback',
        successUrl: process.env.PAYTECH_SUCCESS_URL || 'https://ton-frontend/success',
        cancelUrl: process.env.PAYTECH_CANCEL_URL || 'https://ton-frontend/cancel',
    };
    return new PayTechService(config);
}
//# sourceMappingURL=PayTechService.js.map