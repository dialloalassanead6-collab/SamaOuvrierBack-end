interface Config {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PORT: string;
    readonly DATABASE_URL: string;
    readonly JWT_SECRET: string;
    readonly JWT_EXPIRES_IN: string;
    readonly BCRYPT_ROUNDS: number;
    readonly RATE_LIMIT_WINDOW_MS: number;
    readonly RATE_LIMIT_MAX_REQUESTS: number;
}
export declare const config: Config;
export declare const NODE_ENV: "development" | "production" | "test", PORT: string, DATABASE_URL: string, JWT_SECRET: string, JWT_EXPIRES_IN: string, BCRYPT_ROUNDS: number, RATE_LIMIT_WINDOW_MS: number, RATE_LIMIT_MAX_REQUESTS: number;
export {};
//# sourceMappingURL=config.d.ts.map