import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { z } from "zod";
import { DoctorEntity } from "../entities/doctor.entity";
import { SpecialtyEntity } from "../entities/specialty.entity";

const postgresEnvSchema = z.object({
    POSTGRES_HOST: z.string().min(1),
    POSTGRES_PORT: z.coerce.number().int().min(1).max(65535),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DB: z.string().min(1),
});

const postgresEnv = postgresEnvSchema.parse(process.env);

const postgres = new DataSource({
    type: "postgres",
    host: postgresEnv.POSTGRES_HOST,
    port: postgresEnv.POSTGRES_PORT,
    username: postgresEnv.POSTGRES_USER,
    password: postgresEnv.POSTGRES_PASSWORD,
    database: postgresEnv.POSTGRES_DB,
    entities: [DoctorEntity, SpecialtyEntity],
    synchronize: false,
    logging: false,
});

export const connectPostgres = async () => {
    if (postgres.isInitialized) {
        return;
    }

    await postgres.initialize();
};

export const disconnectPostgres = async () => {
    if (!postgres.isInitialized) {
        return;
    }

    await postgres.destroy();
};

export default postgres;
