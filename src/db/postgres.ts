import { Pool } from "pg";
import { z } from "zod";

const postgresEnvSchema = z.object({
    POSTGRES_HOST: z.string().min(1),
    POSTGRES_PORT: z.coerce.number().int().min(1).max(65535),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DB: z.string().min(1),
});

const postgresEnv = postgresEnvSchema.parse(process.env);

const postgres = new Pool({
    host: postgresEnv.POSTGRES_HOST,
    port: postgresEnv.POSTGRES_PORT,
    user: postgresEnv.POSTGRES_USER,
    password: postgresEnv.POSTGRES_PASSWORD,
    database: postgresEnv.POSTGRES_DB,
});

export const connectPostgres = async () => {
    await postgres.connect();
};

export const disconnectPostgres = async () => {
    if (postgres.totalCount === 0) {
        return;
    }

    await postgres.end();
};

export default postgres;
