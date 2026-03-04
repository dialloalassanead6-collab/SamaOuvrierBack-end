// ============================================================================
// MULTER UPLOAD MIDDLEWARE - Shared Infrastructure
// ============================================================================
// Handles file uploads for worker registration documents
// Uses multer.memoryStorage() + manual Cloudinary upload
// ============================================================================

import multer from 'multer';
import type { Request } from 'express';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed formats
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'pdf'];

// ============================================================================
// FILE FILTER
// ============================================================================

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Type de fichier non autorisé: ${file.mimetype}. Types autorisés: ${allowedMimeTypes.join(', ')}`
      )
    );
  }
};

// ============================================================================
// STORAGE CONFIGURATION - Use memory storage
// ============================================================================

/**
 * Memory storage - files are stored in buffer (req.file.buffer)
 * Upload to Cloudinary happens in the controller/service
 */
const memoryStorage = multer.memoryStorage();

// ============================================================================
// MULTER INSTANCES
// ============================================================================

/**
 * Multer instance for identity card uploads
 * Uses memory storage - file buffer available in req.file.buffer
 */
export const identityUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

/**
 * Multer instance for diploma uploads
 * Uses memory storage - file buffer available in req.file.buffer
 */
export const diplomaUpload = multer({
  storage: memoryStorage,
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
 * Uses memory storage - files will be uploaded to Cloudinary in the controller
 */
export function createWorkerUploadMiddleware() {
  return multer({
    storage: memoryStorage,
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
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  path?: string;
  filename?: string;
}

export interface WorkerUploadedFiles {
  identityCardRecto?: UploadedFile[];
  identityCardVerso?: UploadedFile[];
  diploma?: UploadedFile[];
}

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

export { MAX_FILE_SIZE, ALLOWED_FORMATS };
