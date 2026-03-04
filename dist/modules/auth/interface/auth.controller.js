// ============================================================================
// CONTROLLER D'AUTHENTIFICATION
// ============================================================================
// Gère les requêtes HTTP pour l'authentification.
// Délègue la logique métier au AuthService.
// NE contient PAS de logique métier.
//
// Worker registration now supports file uploads:
// - REQUIRED: identityCardRecto, identityCardVerso
// - OPTIONAL: diploma
// ============================================================================
import { registerSchema, loginSchema } from './auth.validation.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/api-response.js';
import { AUTH_MESSAGES } from '../../../shared/constants/messages.js';
import { workerDocumentService } from '../infrastructure/cloudinary/index.js';
/**
 * Auth Controller
 *
 * RESPONSABILITÉS:
 * - Gérer les requêtes/réponses HTTP
 * - Valider les entrées avec Zod
 * - Déléguer au AuthService
 * - AUCUNE logique métier ici!
 */
export class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    /**
     * Inscription d'un nouvel utilisateur
     * POST /auth/register
     *
     * Pour les WORKERS:
     * - identityCardRecto: REQUIRED (uploaded file)
     * - identityCardVerso: REQUIRED (uploaded file)
     * - diploma: OPTIONAL (uploaded file)
     */
    async register(req, res, next) {
        try {
            // Get files from request (uploaded by multer)
            const files = req.files;
            // Parse the body data
            const bodyData = req.body;
            // For worker registration, we need to handle file uploads
            if (bodyData.type === 'WORKER') {
                // Validate required identity card files
                if (!files?.identityCardRecto || !files.identityCardRecto[0]) {
                    return sendCreated(res, AUTH_MESSAGES.REGISTER_SUCCESS, {
                        user: null,
                        token: '',
                    });
                }
                if (!files?.identityCardVerso || !files.identityCardVerso[0]) {
                    return sendCreated(res, AUTH_MESSAGES.REGISTER_SUCCESS, {
                        user: null,
                        token: '',
                    });
                }
                // Upload identity card recto to Cloudinary
                const identityCardRectoFile = files.identityCardRecto[0];
                const identityCardRectoResult = await workerDocumentService.uploadDocument({
                    buffer: identityCardRectoFile.buffer,
                    originalname: identityCardRectoFile.originalname,
                    mimetype: identityCardRectoFile.mimetype,
                    size: identityCardRectoFile.size,
                }, 'identityCardRecto', bodyData.email);
                // Upload identity card verso to Cloudinary
                const identityCardVersoFile = files.identityCardVerso[0];
                const identityCardVersoResult = await workerDocumentService.uploadDocument({
                    buffer: identityCardVersoFile.buffer,
                    originalname: identityCardVersoFile.originalname,
                    mimetype: identityCardVersoFile.mimetype,
                    size: identityCardVersoFile.size,
                }, 'identityCardVerso', bodyData.email);
                // Upload diploma if provided (OPTIONAL)
                let diplomaResult = null;
                if (files?.diploma && files.diploma[0]) {
                    const diplomaFile = files.diploma[0];
                    diplomaResult = await workerDocumentService.uploadDocument({
                        buffer: diplomaFile.buffer,
                        originalname: diplomaFile.originalname,
                        mimetype: diplomaFile.mimetype,
                        size: diplomaFile.size,
                    }, 'diploma', bodyData.email);
                }
                // Add file URLs to the request body for validation
                bodyData.identityCardRecto = {
                    url: identityCardRectoResult.url,
                    publicId: identityCardRectoResult.publicId,
                    format: identityCardRectoResult.format,
                    bytes: identityCardRectoResult.bytes,
                };
                bodyData.identityCardVerso = {
                    url: identityCardVersoResult.url,
                    publicId: identityCardVersoResult.publicId,
                    format: identityCardVersoResult.format,
                    bytes: identityCardVersoResult.bytes,
                };
                if (diplomaResult) {
                    bodyData.diploma = {
                        url: diplomaResult.url,
                        publicId: diplomaResult.publicId,
                        format: diplomaResult.format,
                        bytes: diplomaResult.bytes,
                    };
                }
                else {
                    // Explicitly delete diploma if not provided to match schema
                    delete bodyData.diploma;
                }
            }
            // Validation de la requête
            const validatedData = registerSchema.parse(bodyData);
            // Exécution de l'inscription
            // @ts-ignore - TypeScript strict mode issue with optional properties
            const result = await this.authService.register(validatedData);
            // Réponse de succès (201 Created) - MUST RETURN
            return sendCreated(res, AUTH_MESSAGES.REGISTER_SUCCESS, {
                user: result.user,
                token: result.token,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Connexion utilisateur
     * POST /auth/login
     */
    async login(req, res, next) {
        try {
            // Validation de la requête
            const validatedData = loginSchema.parse({ body: req.body });
            // Exécution de la connexion
            const result = await this.authService.login(validatedData.body.email, validatedData.body.password);
            // Réponse de succès (200 OK) - MUST RETURN
            return sendSuccess(res, AUTH_MESSAGES.LOGIN_SUCCESS, {
                user: result.user,
                token: result.token,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=auth.controller.js.map