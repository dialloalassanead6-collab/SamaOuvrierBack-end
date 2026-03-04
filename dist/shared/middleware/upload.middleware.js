// ============================================================================
// MULTER UPLOAD MIDDLEWARE - Shared Infrastructure
// ============================================================================
// Handles file uploads for worker registration documents
// Uses Cloudinary as storage backend
// ============================================================================
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
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
// CONFIGURATION
// ============================================================================
// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Allowed formats
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'pdf'];
// ============================================================================
// FILE FILTER
// ============================================================================
const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Type de fichier non autorisé: ${file.mimetype}. Types autorisés: ${allowedMimeTypes.join(', ')}`));
    }
};
// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================
/**
 * Storage for worker identity documents (REQUIRED)
 * Uses folder: workers/documents/{email}/identity
 */
const identityStorage = new CloudinaryStorage({
    cloudinary,
    params: (_req, file) => {
        // Extract email from form-data or use temporary folder
        const email = _req.body?.email || 'temp';
        return {
            folder: `workers/documents/${email}/identity`,
            allowed_formats: ALLOWED_FORMATS,
            resource_type: 'auto',
            public_id: `${file.fieldname}_${Date.now()}`,
        };
    },
});
/**
 * Storage for worker diploma/certificate (OPTIONAL)
 * Uses folder: workers/documents/{email}/diploma
 */
const diplomaStorage = new CloudinaryStorage({
    cloudinary,
    params: (_req, file) => {
        const email = _req.body?.email || 'temp';
        return {
            folder: `workers/documents/${email}/diploma`,
            allowed_formats: ALLOWED_FORMATS,
            resource_type: 'auto',
            public_id: `diploma_${Date.now()}`,
        };
    },
});
// ============================================================================
// MULTER INSTANCES
// ============================================================================
/**
 * Multer instance for identity card uploads
 */
export const identityUpload = multer({
    storage: identityStorage,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter,
});
/**
 * Multer instance for diploma uploads
 */
export const diplomaUpload = multer({
    storage: diplomaStorage,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter,
});
// Named fields for worker registration
export const workerUploadFields = [
    { name: 'identityCardRecto', maxCount: 1 },
    { name: 'identityCardVerso', maxCount: 1 },
    { name: 'diploma', maxCount: 1 },
];
// ============================================================================
// UPLOAD MIDDLEWARE FACTORY
// ============================================================================
/**
 * Create upload middleware for worker registration
 * Handles both required (identity) and optional (diploma) documents
 */
export function createWorkerUploadMiddleware() {
    return multer({
        storage: multer.diskStorage({
            filename: (_req, file, cb) => {
                cb(null, `${file.fieldname}_${Date.now()}`);
            },
        }),
        limits: {
            fileSize: MAX_FILE_SIZE,
        },
        fileFilter,
    }).fields(workerUploadFields);
}
// ============================================================================
// ERROR HANDLING
// ============================================================================
export class UploadError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UploadError';
    }
}
//# sourceMappingURL=upload.middleware.js.map