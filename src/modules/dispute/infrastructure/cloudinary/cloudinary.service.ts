// ============================================================================
// CLOUDINARY SERVICE - Infrastructure Layer
// ============================================================================
// Handles file uploads to Cloudinary for dispute evidence
// With hardened security configurations
// ============================================================================

import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

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

// Maximum file size: 10MB (as per requirement)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed formats for disputes
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'pdf', 'mp4'];

// Allowed MIME types - pre-computed arrays
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'];
const DOCUMENT_MIME_TYPES = ['application/pdf'];

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

export class CloudinaryService {
  /**
   * Determine resource type based on MIME type
   */
  private getResourceType(mimeType: string): 'image' | 'video' | 'raw' | 'auto' {
    if (IMAGE_MIME_TYPES.includes(mimeType)) return 'image';
    if (VIDEO_MIME_TYPES.includes(mimeType)) return 'video';
    return 'raw';
  }

  /**
   * Get file extension from original name
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Validate file before upload with strict security checks
   */
  validateFile(file: EvidenceFile, _disputeId: string): { valid: boolean; error?: string } {
    // 1. Check file extension
    const extension = this.getFileExtension(file.originalname);
    if (!ALLOWED_FORMATS.includes(extension)) {
      return {
        valid: false,
        error: `Format de fichier non autorisé: .${extension}. Formats autorisés: ${ALLOWED_FORMATS.join(', ')}`,
      };
    }

    // 2. Check MIME type is in allowed list
    const allowedMimeTypes = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES, ...DOCUMENT_MIME_TYPES];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Type MIME non autorisé: ${file.mimetype}`,
      };
    }

    // 3. Check file size (10MB max as per requirement)
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
   * Upload evidence file to Cloudinary with security configurations
   * 
   * Security features:
   * - folder: disputes/${disputeId} - isolates files per dispute
   * - allowed_formats: restricts file formats
   * - max_file_size: limits upload size
   * - context: tracks uploader and dispute ID
   */
  async uploadEvidence(
    file: EvidenceFile,
    disputeId: string,
    uploadedBy: string
  ): Promise<CloudinaryUploadResult> {
    // Validate file first
    const validation = this.validateFile(file, disputeId);
    if (!validation.valid) {
      throw new CloudinaryError(validation.error || 'Invalid file');
    }

    const resourceType = this.getResourceType(file.mimetype);

    // Security-focused upload options
    const uploadOptions: Record<string, unknown> = {
      // ✅ SÉCURISATION CLOUDINARY - Folder par dispute
      folder: `disputes/${disputeId}`,
      resource_type: resourceType,
      public_id: `evidence_${Date.now()}`,
      
      // ✅ Restrict formats
      allowed_formats: ALLOWED_FORMATS,
      
      // ✅ Max file size (10MB)
      max_file_size: MAX_FILE_SIZE,
      
      // Metadata for tracking
      context: {
        uploadedBy,
        disputeId,
        uploadedAt: new Date().toISOString(),
      },
    };

    // Add transformation for images (optimization + security)
    if (resourceType === 'image') {
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 2000, height: 2000, crop: 'limit' }, // Limit dimensions
      ];
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new CloudinaryError(error.message));
          } else if (result) {
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
        }
      );
      
      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete evidence file from Cloudinary
   * Used when evidence is removed from dispute
   */
  async deleteEvidence(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new CloudinaryError('Failed to delete evidence');
    }
  }

  /**
   * Delete all evidence for a dispute
   * Used when dispute is deleted
   */
  async deleteDisputeEvidence(disputeId: string): Promise<void> {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: `disputes/${disputeId}`,
      });
      
      const deletePromises = result.resources.map(
        (resource: { public_id: string }) => 
          cloudinary.uploader.destroy(resource.public_id)
      );
      
      await Promise.all(deletePromises);
    } catch (error) {
      // Ignore errors during bulk delete
      console.error('Error deleting dispute evidence:', error);
    }
  }

  /**
   * Verify a file belongs to a specific dispute
   * Used for security verification
   */
  async verifyFileOwnership(publicId: string, disputeId: string): Promise<boolean> {
    try {
      const resource = await cloudinary.api.resource(publicId);
      
      // Check if file is in the correct folder
      const folder = resource?.folder || '';
      return folder === `disputes/${disputeId}`;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// CUSTOM EXCEPTIONS
// ============================================================================

export class CloudinaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CloudinaryError';
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const cloudinaryService = new CloudinaryService();
