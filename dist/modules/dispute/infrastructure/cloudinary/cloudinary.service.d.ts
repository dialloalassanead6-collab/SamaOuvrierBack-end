export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
    format: string;
    width?: number;
    height?: number;
    bytes: number;
    resourceType: string;
}
export interface EvidenceFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}
export declare class CloudinaryService {
    /**
     * Determine resource type based on MIME type
     */
    private getResourceType;
    /**
     * Get file extension from original name
     */
    private getFileExtension;
    /**
     * Validate file before upload with strict security checks
     */
    validateFile(file: EvidenceFile, _disputeId: string): {
        valid: boolean;
        error?: string;
    };
    /**
     * Upload evidence file to Cloudinary with security configurations
     *
     * Security features:
     * - folder: disputes/${disputeId} - isolates files per dispute
     * - allowed_formats: restricts file formats
     * - max_file_size: limits upload size
     * - context: tracks uploader and dispute ID
     */
    uploadEvidence(file: EvidenceFile, disputeId: string, uploadedBy: string): Promise<CloudinaryUploadResult>;
    /**
     * Delete evidence file from Cloudinary
     * Used when evidence is removed from dispute
     */
    deleteEvidence(publicId: string): Promise<void>;
    /**
     * Delete all evidence for a dispute
     * Used when dispute is deleted
     */
    deleteDisputeEvidence(disputeId: string): Promise<void>;
    /**
     * Verify a file belongs to a specific dispute
     * Used for security verification
     */
    verifyFileOwnership(publicId: string, disputeId: string): Promise<boolean>;
}
export declare class CloudinaryError extends Error {
    constructor(message: string);
}
export declare const cloudinaryService: CloudinaryService;
//# sourceMappingURL=cloudinary.service.d.ts.map