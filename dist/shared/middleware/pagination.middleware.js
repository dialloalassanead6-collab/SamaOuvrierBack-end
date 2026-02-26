// ============================================================================
// MIDDLEWARE - Pagination Middleware
// ============================================================================
// This middleware handles secure, centralized pagination for all paginated routes.
//
// SECURITY FEATURES:
// - Default values: page=1, pageSize=10 (prevents null/undefined issues)
// - Maximum pageSize limit: 100 (prevents DoS attacks via large queries)
// - Invalid values fallback to defaults (graceful error handling)
//
// HOW IT WORKS:
// 1. Parses 'page' and 'pageSize' from req.query
// 2. Validates and normalizes values:
//    - page: must be >= 1, defaults to 1 if invalid
//    - pageSize: must be >= 1, defaults to 10 if invalid, capped at MAX_PAGE_SIZE
// 3. Attaches { page, pageSize, skip, take } to req.pagination
// 4. Controllers use req.pagination to build queries
//
// USAGE:
//   import { pagination } from '../../shared/middleware/index.js';
//   router.get('/users', pagination(), userController.getAll);
// ============================================================================
// ============================================================================
// CONFIGURATION
// ============================================================================
// Maximum allowed pageSize to prevent DoS attacks
// A client requesting pageSize=1000000 could overwhelm the database
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
// ============================================================================
// MIDDLEWARE FUNCTION
// ============================================================================
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
export const pagination = (options) => {
    // Allow configuration overrides with safe defaults
    const maxPageSize = options?.maxPageSize ?? MAX_PAGE_SIZE;
    const defaultPageSize = options?.defaultPageSize ?? DEFAULT_PAGE_SIZE;
    const defaultPage = options?.defaultPage ?? DEFAULT_PAGE;
    return (req, _res, next) => {
        try {
            // Parse page from query string
            // Number() returns NaN for non-numeric strings, which fails comparison
            const rawPage = req.query.page;
            const parsedPage = typeof rawPage === 'string' ? Number(rawPage) : NaN;
            // Validate page: must be >= 1 and a valid number
            const page = !isNaN(parsedPage) && parsedPage >= 1 ? parsedPage : defaultPage;
            // Parse pageSize from query string
            const rawPageSize = req.query.pageSize;
            const parsedPageSize = typeof rawPageSize === 'string' ? Number(rawPageSize) : NaN;
            // Validate pageSize: must be >= 1 and a valid number
            // Then cap at maximum to prevent DoS
            let pageSize = !isNaN(parsedPageSize) && parsedPageSize >= 1 ? parsedPageSize : defaultPageSize;
            pageSize = Math.min(pageSize, maxPageSize);
            // Calculate skip and take for Prisma queries
            // skip = (page - 1) * pageSize
            const skip = (page - 1) * pageSize;
            const take = pageSize;
            // Attach pagination params to request
            // Controllers access via req.pagination
            req.pagination = {
                page,
                pageSize,
                skip,
                take,
            };
            next();
        }
        catch (error) {
            // On any error, fallback to defaults (graceful degradation)
            // This ensures the API remains functional even with malformed requests
            req.pagination = {
                page: defaultPage,
                pageSize: Math.min(defaultPageSize, maxPageSize),
                skip: 0,
                take: Math.min(defaultPageSize, maxPageSize),
            };
            next();
        }
    };
};
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
export const getPaginationMetadata = (page, pageSize, total) => {
    const totalPages = Math.ceil(total / pageSize);
    return {
        page,
        pageSize,
        total,
        totalPages,
    };
};
// ============================================================================
// DEFAULT EXPORT
// ============================================================================
export default pagination;
//# sourceMappingURL=pagination.middleware.js.map