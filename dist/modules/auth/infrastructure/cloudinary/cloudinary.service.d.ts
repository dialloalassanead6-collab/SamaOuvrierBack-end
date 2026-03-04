export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
    format: string;
    width?: number;
    height?: number;
    bytes: number;
    resourceType: string;
}
export interface DocumentFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}
export type DocumentType = 'identityCardRecto' | 'identityCardVerso' | 'diploma';
export declare class WorkerDocumentService {
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
    validateFile(file: DocumentFile, documentType: DocumentType): {
        valid: boolean;
        error?: string;
    };
    /**
     * Upload worker document to Cloudinary
     *
     * Security features:
     * - folder: workers/documents - isolates files per worker
     * - allowed_formats: restricts file formats
     * - max_file_size: limits upload size
     * - context: tracks document type and upload time
     */
    uploadDocument(file: DocumentFile, documentType: DocumentType, workerEmail: string): Promise<CloudinaryUploadResult>;
    /**
     * Delete worker document from Cloudinary
     */
    deleteDocument(publicId: string): Promise<void>;
    /**
     * Delete all documents for a worker
     */
    deleteWorkerDocuments(workerEmail: string): Promise<void>;
}
export declare class WorkerDocumentError extends Error {
    constructor(message: string);
}
export declare const workerDocumentService: WorkerDocumentService;
//# sourceMappingURL=cloudinary.service.d.ts.map