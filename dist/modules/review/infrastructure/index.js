/**
 * Review Infrastructure Index
 * Exports all infrastructure implementations
 */
import { prisma } from '../../../shared/prisma.js';
import { PrismaReviewRepository } from './prisma/prisma-review.repository.js';
// Use shared singleton instance
export const reviewRepository = new PrismaReviewRepository(prisma);
export { PrismaReviewRepository } from './prisma/prisma-review.repository.js';
//# sourceMappingURL=index.js.map