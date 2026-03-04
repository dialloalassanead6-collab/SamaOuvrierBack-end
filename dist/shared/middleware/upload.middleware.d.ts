import multer from 'multer';
/**
 * Multer instance for identity card uploads
 */
export declare const identityUpload: multer.Multer;
/**
 * Multer instance for diploma uploads
 */
export declare const diplomaUpload: multer.Multer;
export declare const workerUploadFields: {
    name: string;
    maxCount: number;
}[];
/**
 * Create upload middleware for worker registration
 * Handles both required (identity) and optional (diploma) documents
 */
export declare function createWorkerUploadMiddleware(): import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare class UploadError extends Error {
    constructor(message: string);
}
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
//# sourceMappingURL=upload.middleware.d.ts.map