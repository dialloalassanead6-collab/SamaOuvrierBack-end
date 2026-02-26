// Environment Configuration
import { z } from 'zod';
// Environment schema validation
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    BCRYPT_ROUNDS: z.coerce.number().default(12),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
}).required();
// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error('Invalid environment variables:', parsedEnv.error.flatten().fieldErrors);
    process.exit(1);
}
// Create config object with explicit typing
export const config = {
    NODE_ENV: parsedEnv.data.NODE_ENV,
    PORT: parsedEnv.data.PORT,
    DATABASE_URL: parsedEnv.data.DATABASE_URL,
    JWT_SECRET: parsedEnv.data.JWT_SECRET,
    JWT_EXPIRES_IN: parsedEnv.data.JWT_EXPIRES_IN,
    BCRYPT_ROUNDS: parsedEnv.data.BCRYPT_ROUNDS,
    RATE_LIMIT_WINDOW_MS: parsedEnv.data.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: parsedEnv.data.RATE_LIMIT_MAX_REQUESTS,
};
// Export individual config values for convenience
export const { NODE_ENV, PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, } = config;
//# sourceMappingURL=config.js.map