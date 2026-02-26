import type { Request, Response, NextFunction } from 'express';
/**
 * Pagination parameters attached to req.pagination
 */
export interface PaginationParams {
    /** Current page number (1-based) */
    page: number;
    /** Number of items per page */
    pageSize: number;
    /** Number of items to skip (for Prisma: skip) */
    skip: number;
    /** Number of items to take (for Prisma: take) */
    take: number;
}
/**
 * Extended Express Request with pagination
 */
declare global {
    namespace Express {
        interface Request {
            pagination?: PaginationParams;
        }
    }
}
/**
 * Pagination middleware options (for future extensibility)
 */
export interface PaginationOptions {
    /** Maximum allowed pageSize (default: 100) */
    maxPageSize?: number;
    /** Default page size (default: 10) */
    defaultPageSize?: number;
    /** Default page number (default: 1) */
    defaultPage?: number;
}
/**
 * Creates pagination middleware with optional custom options
 *
 * @param options - Optional configuration overrides
 * @returns Express middleware function
 *
 * @example
 * // Basic usage
 * router.get('/users', pagination(), userController.getAll);
 *
 * @example
 * // With custom options
 * router.get('/items', pagination({ maxPageSize: 50 }), itemController.list);
 */
export declare const pagination: (options?: PaginationOptions) => ((req: Request, res: Response, next: NextFunction) => void);
/**
 * Helper function to calculate pagination metadata
 * Use this in controllers to generate the response metadata
 *
 * @param page - Current page number
 * @param pageSize - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata object
 *
 * @example
 * const { users, total } = await getUsersUseCase.execute(pagination.skip, pagination.take);
 * const paginationMeta = getPaginationMetadata(pagination.page, pagination.pageSize, total);
 * res.json({ data: users, ...paginationMeta });
 */
export declare const getPaginationMetadata: (page: number, pageSize: number, total: number) => {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};
export default pagination;
//# sourceMappingURL=pagination.middleware.d.ts.map