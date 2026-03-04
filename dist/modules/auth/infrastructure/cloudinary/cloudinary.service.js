// ============================================================================
// CLOUDINARY SERVICE - Infrastructure Layer
// ============================================================================
// Handles file uploads to Cloudinary for worker documents during registration
// With hardened security configurations
// ============================================================================
import { v2 as cloudinary } from 'cloudinary';
// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
}
// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================
// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Allowed formats for worker documents
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'pdf'];
// Allowed MIME types
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const DOCUMENT_MIME_TYPES = ['application/pdf'];
// ============================================================================
// SERVICE CLASS
// ============================================================================
export class WorkerDocumentService {
    /**
     * Determine resource type based on MIME type
     */
    getResourceType(mimeType) {
        if (IMAGE_MIME_TYPES.includes(mimeType))
            return 'image';
        return 'raw';
    }
    /**
     * Get file extension from original name
     */
    getFileExtension(filename) {
        return filename.split('.').pop()?.toLowerCase() || '';
    }
    /**
     * Validate file before upload with strict security checks
     */
    validateFile(file, documentType) {
        // 1. Check file extension
        const extension = this.getFileExtension(file.originalname);
        if (!ALLOWED_FORMATS.includes(extension)) {
            return {
                valid: false,
                error: `Format de fichier non autorisé: .${extension}. Formats autorisés: ${ALLOWED_FORMATS.join(', ')}`,
            };
        }
        // 2. Check MIME type is in allowed list
        const allowedMimeTypes = [...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return {
                valid: false,
                error: `Type MIME non autorisé: ${file.mimetype}`,
            };
        }
        // 3. Check file size (10MB max)
        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `La taille du fichier dépasse la limite maximale de 10MB. Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
            };
        }
        // 4. Validate buffer exists
        if (!file.buffer || file.buffer.length === 0) {
            return {
                valid: false,
                error: 'Le fichier est vide ou corrompu',
            };
        }
        return { valid: true };
    }
    /**
     * Upload worker document to Cloudinary
     *
     * Security features:
     * - folder: workers/documents - isolates files per worker
     * - allowed_formats: restricts file formats
     * - max_file_size: limits upload size
     * - context: tracks document type and upload time
     */
    async uploadDocument(file, documentType, workerEmail) {
        // Validate file first
        const validation = this.validateFile(file, documentType);
        if (!validation.valid) {
            throw new WorkerDocumentError(validation.error || 'Invalid file');
        }
        const resourceType = this.getResourceType(file.mimetype);
        // Security-focused upload options
        const uploadOptions = {
            // ✅ SÉCURISATION CLOUDINARY - Folder par worker
            folder: `workers/documents/${workerEmail}`,
            resource_type: resourceType,
            public_id: `${documentType}_${Date.now()}`,
            // ✅ Restrict formats
            allowed_formats: ALLOWED_FORMATS,
            // ✅ Max file size (10MB)
            max_file_size: MAX_FILE_SIZE,
            // Metadata for tracking
            context: {
                documentType,
                uploadedAt: new Date().toISOString(),
            },
        };
        // Add transformation for images (optimization + security)
        if (resourceType === 'image') {
            uploadOptions.transformation = [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 2000, height: 2000, crop: 'limit' },
            ];
        }
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    reject(new WorkerDocumentError(error.message));
                }
                else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        format: result.format,
                        width: result.width,
                        height: result.height,
                        bytes: result.bytes,
                        resourceType: result.resource_type,
                    });
                }
            });
            uploadStream.end(file.buffer);
        });
    }
    /**
     * Delete worker document from Cloudinary
     */
    async deleteDocument(publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        }
        catch (error) {
            throw new WorkerDocumentError('Failed to delete document');
        }
    }
    /**
     * Delete all documents for a worker
     */
    async deleteWorkerDocuments(workerEmail) {
        try {
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: `workers/documents/${workerEmail}`,
            });
            const deletePromises = result.resources.map((resource) => cloudinary.uploader.destroy(resource.public_id));
            await Promise.all(deletePromises);
        }
        catch (error) {
            // Ignore errors during bulk delete
            console.error('Error deleting worker documents:', error);
        }
    }
}
// ============================================================================
// CUSTOM EXCEPTIONS
// ============================================================================
export class WorkerDocumentError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WorkerDocumentError';
    }
}
// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
export const workerDocumentService = new WorkerDocumentService();
//# sourceMappingURL=cloudinary.service.js.map