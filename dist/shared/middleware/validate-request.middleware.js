import { ZodError } from 'zod';
/**
 * Creates a validation middleware for the given Zod schema
 * @param schema - The Zod schema to validate against
 * @param location - Where to validate: 'body' | 'query' | 'params'
 */
export function validateRequest(schema, location = 'body') {
    return (req, res, next) => {
        try {
            const dataToValidate = req[location];
            schema.parse(dataToValidate);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors,
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    };
}
//# sourceMappingURL=validate-request.middleware.js.map