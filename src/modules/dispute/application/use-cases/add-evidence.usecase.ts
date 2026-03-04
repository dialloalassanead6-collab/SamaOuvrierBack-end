// ============================================================================
// ADD EVIDENCE USE CASE - Application Layer
// ============================================================================
// Handles adding evidence (files) to a dispute via Cloudinary
// With hardened security rules
// ============================================================================

import type { IDisputeRepository, CreateEvidenceInput } from '../dispute.repository.interface.js';
import { DisputeDomainError } from '../../domain/index.js';
import { cloudinaryService, type EvidenceFile } from '../../infrastructure/cloudinary/cloudinary.service.js';

// Dispute event types for audit trail
const DISPUTE_EVENTS = {
  EVIDENCE_ADDED: 'EVIDENCE_ADDED',
} as const;

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/webm',
];

export interface AddEvidenceInputDTO {
  disputeId: string;
  uploadedBy: string;
  file: EvidenceFile;
  description?: string;
}

export interface AddEvidenceOutputDTO {
  id: string;
  disputeId: string;
  url: string;
  publicId: string;
  type: string;
  mimeType?: string;
  size?: number;
  description?: string;
  uploadedBy: string;
  createdAt: Date;
}

export class AddEvidenceUseCase {
  constructor(private disputeRepository: IDisputeRepository) {}

  /**
   * Execute the use case to add evidence to a dispute
   * With hardened security:
   * - Verifies ownership (only reporter or reported user can add evidence)
   * - Checks dispute is not already resolved or closed
   * - Validates file MIME type server-side
   * - Limits file size to 10MB
   * - Creates audit trail event
   */
  async execute(input: AddEvidenceInputDTO): Promise<AddEvidenceOutputDTO> {
    // 1. Find the dispute with mission details
    const dispute = await this.disputeRepository.findById(input.disputeId);
    
    if (!dispute) {
      throw new DisputeDomainError('Dispute introuvable');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyDispute = dispute as any;

    // 2. ✅ SÉCURITÉ DES ACTIONS - Vérifier ownership
    // Check user is either reporter or reported user of the dispute
    if (anyDispute.reporter_id !== input.uploadedBy && anyDispute.reported_user_id !== input.uploadedBy) {
      throw new DisputeDomainError(
        'Vous n\'êtes pas autorisé à ajouter des preuves à cette dispute. Seuls les parties impliquées peuvent ajouter des preuves.'
      );
    }

    // 3. ✅ INTERDIRE SI DISPUTE CLÔTURÉ
    // Check dispute can accept evidence (not closed or resolved)
    if (anyDispute.status === 'RESOLVED' || anyDispute.status === 'CLOSED') {
      throw new DisputeDomainError(
        'Impossible d\'ajouter des preuves à une dispute résolue ou fermée'
      );
    }

    // 4. ✅ VALIDATION CÔTÉ SERVEUR - Vérifier type MIME
    if (!ALLOWED_MIME_TYPES.includes(input.file.mimetype)) {
      throw new DisputeDomainError(
        `Type de fichier non autorisé: ${input.file.mimetype}. Types autorisés: jpg, png, gif, webp, pdf, mp4, webm`
      );
    }

    // 5. ✅ LIMITE DE TAILLE - 10MB max
    if (input.file.size > MAX_FILE_SIZE) {
      throw new DisputeDomainError(
        `La taille du fichier dépasse la limite maximale de 10MB. Taille du fichier: ${(input.file.size / 1024 / 1024).toFixed(2)}MB`
      );
    }

    // 6. Upload file to Cloudinary with security settings
    const uploadResult = await cloudinaryService.uploadEvidence(
      input.file,
      input.disputeId,
      input.uploadedBy
    );

    // 7. Save evidence to database with transaction
    const evidence = await this.disputeRepository.transaction(async () => {
      const evidenceInput: CreateEvidenceInput = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        type: uploadResult.resourceType,
        mimeType: input.file.mimetype,
        size: input.file.size,
        description: input.description || null,
        uploadedBy: input.uploadedBy,
      };

      const createdEvidence = await this.disputeRepository.addEvidence(
        input.disputeId,
        evidenceInput
      );

      // Create audit event
      await this.disputeRepository.createEvent(input.disputeId, {
        type: DISPUTE_EVENTS.EVIDENCE_ADDED,
        performedBy: input.uploadedBy,
        metadata: {
          evidenceId: createdEvidence.id,
          fileType: uploadResult.resourceType,
          mimeType: input.file.mimetype,
          size: input.file.size,
        },
      });

      return createdEvidence;
    });

    // 8. Return result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyEvidence = evidence as any;
    
    return {
      id: anyEvidence.id,
      disputeId: anyEvidence.dispute_id,
      url: anyEvidence.url,
      publicId: anyEvidence.public_id,
      type: anyEvidence.type,
      mimeType: anyEvidence.mime_type,
      size: anyEvidence.size,
      description: anyEvidence.description,
      uploadedBy: anyEvidence.uploaded_by,
      createdAt: anyEvidence.created_at,
    };
  }
}
