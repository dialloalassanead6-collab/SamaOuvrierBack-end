import type { IDisputeRepository } from '../dispute.repository.interface.js';
import { type EvidenceFile } from '../../infrastructure/cloudinary/cloudinary.service.js';
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
export declare class AddEvidenceUseCase {
    private disputeRepository;
    constructor(disputeRepository: IDisputeRepository);
    /**
     * Execute the use case to add evidence to a dispute
     * With hardened security:
     * - Verifies ownership (only reporter or reported user can add evidence)
     * - Checks dispute is not already resolved or closed
     * - Validates file MIME type server-side
     * - Limits file size to 10MB
     * - Creates audit trail event
     */
    execute(input: AddEvidenceInputDTO): Promise<AddEvidenceOutputDTO>;
}
//# sourceMappingURL=add-evidence.usecase.d.ts.map