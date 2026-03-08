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

import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../auth.service.js';
import type { LoginRequest } from './auth.validation.js';
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
  constructor(private readonly authService: AuthService) {}

  /**
   * Inscription d'un nouvel utilisateur
   * POST /auth/register
   * 
   * Pour les WORKERS:
   * - identityCardRecto: REQUIRED (uploaded file)
   * - identityCardVerso: REQUIRED (uploaded file)
   * - diploma: OPTIONAL (uploaded file)
   */
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      // Get files from request (uploaded by multer)
      // With .any(), files is an array, not an object
      const files = req.files as Express.Multer.File[] | undefined;
      
      // Parse the body data
      const bodyData = req.body;
      
      // DEBUG: Log to see what's received
      console.log('=== DEBUG REGISTER ===');
      console.log('bodyData.type:', bodyData.type);
      console.log('files:', files);
      console.log('files count:', files?.length);
      
      // Helper function to find file by fieldname
      const findFile = (fieldname: string): Express.Multer.File | undefined => {
        const found = files?.find(f => f.fieldname === fieldname);
        console.log(`Finding ${fieldname}:`, found ? 'FOUND' : 'NOT FOUND');
        return found;
      };
      
      // For worker registration, we need to handle file uploads
      if (bodyData.type === 'WORKER') {
        // Validate required identity card files
        const identityCardRectoFile = findFile('identityCardRecto');
        const identityCardVersoFile = findFile('identityCardVerso');
        
        if (!identityCardRectoFile) {
          return res.status(400).json({
            success: false,
            message: 'Le fichier identityCardRecto (recto de la carte d\'identite) est requis pour l\'inscription worker',
            code: 'MISSING_FILE',
          });
        }
        if (!identityCardVersoFile) {
          return res.status(400).json({
            success: false,
            message: 'Le fichier identityCardVerso (verso de la carte d\'identite) est requis pour l\'inscription worker',
            code: 'MISSING_FILE',
          });
        }
        
        // Upload identity card recto to Cloudinary
        const identityCardRectoResult = await workerDocumentService.uploadDocument(
          {
            buffer: identityCardRectoFile.buffer,
            originalname: identityCardRectoFile.originalname,
            mimetype: identityCardRectoFile.mimetype,
            size: identityCardRectoFile.size,
          },
          'identityCardRecto',
          bodyData.email
        );
        
        // Upload identity card verso to Cloudinary
        const identityCardVersoResult = await workerDocumentService.uploadDocument(
          {
            buffer: identityCardVersoFile.buffer,
            originalname: identityCardVersoFile.originalname,
            mimetype: identityCardVersoFile.mimetype,
            size: identityCardVersoFile.size,
          },
          'identityCardVerso',
          bodyData.email
        );
        
        // Upload diploma if provided (OPTIONAL)
        let diplomaResult = null;
        const diplomaFile = findFile('diploma');
        if (diplomaFile) {
          diplomaResult = await workerDocumentService.uploadDocument(
            {
              buffer: diplomaFile.buffer,
              originalname: diplomaFile.originalname,
              mimetype: diplomaFile.mimetype,
              size: diplomaFile.size,
            },
            'diploma',
            bodyData.email
          );
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
        } else {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Connexion utilisateur
   * POST /auth/login
   */
  async login(
    req: Request<unknown, unknown, LoginRequest>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      // Validation de la requête
      const validatedData = loginSchema.parse({ body: req.body });

      // Exécution de la connexion
      const result = await this.authService.login(
        validatedData.body.email,
        validatedData.body.password
      );

      // Réponse de succès (200 OK) - MUST RETURN
      return sendSuccess(res, AUTH_MESSAGES.LOGIN_SUCCESS, {
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  }
}
